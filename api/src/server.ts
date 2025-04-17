import express, { Application, NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import multer, { FileFilterCallback } from "multer";
import { v4 as uuidv4 } from 'uuid';
import { Readable } from "stream";
import { google as googleApis } from 'googleapis'; // Módosított név
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Környezeti változók betöltése
dotenv.config({
    path: path.join(__dirname, "/.env"),
});

const app: Application = express();
const PORT: number = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// OAuth2 konfiguráció
const oauth2Client = new googleApis.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

// Gmail API inicializálása
const gmail = googleApis.gmail({ version: 'v1', auth: oauth2Client });

// Email küldése Gmail API-val
async function sendEmail(to: string, subject: string, html: string) {
    try {
        const utf8Subject = `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;
        const utf8FromName = `=?UTF-8?B?${Buffer.from('HéCarFest').toString('base64')}?=`;
        
        const messageParts = [
            `From: ${utf8FromName} <${process.env.GMAIL_USER}>`,
            `To: ${to}`,
            'Content-Type: text/html; charset=UTF-8',
            'MIME-Version: 1.0',
            `Subject: ${utf8Subject}`,
            '',
            html
        ];
        
        const message = messageParts.join('\n');
        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, ''); 

        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage
            }
        });
        
        console.log('Email elküldve:', res.data.id);
        return res.data;
        
    } catch (error) {
        console.error('Hiba email küldéskor:', error);
        throw error;
    }
}

// Multer konfiguráció
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) cb(null, true);
        else cb(new Error('Csak képek (jpeg, jpg, png, webp) engedélyezettek!'));
    }
});

// MongoDB kapcsolat
mongoose.connect(process.env.MONGODB_URL as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
} as mongoose.ConnectOptions)
    .then(() => {
        console.log("Csatlakozva a MongoDB-hez!");
    })
    .catch((err: Error) => {
        console.error("MongoDB kapcsolati hiba:", err);
    });

// Google Drive konfiguráció
const KEYFILEPATH = 'C:\\hecarfest.hu\\hecarfest.hu\\api\\src\\hecarfest-vip-1c7e3c451f3f.json';
const authDrive = new googleApis.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = googleApis.drive({ version: 'v3', auth: authDrive });

// Segédfüggvény a Google Drive-ba feltöltéshez
async function uploadToDrive(file: Express.Multer.File): Promise<string> {
    try {
        const fileMetadata = {
            name: `${Date.now()}_${file.originalname}`,
            parents: ["1VVxhZ0BMwck3V_3kNktawQRt4puASq6X"],
        };

        const media = {
            mimeType: file.mimetype,
            body: Readable.from(file.buffer),
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id',
        });

        await drive.permissions.create({
            fileId: response.data.id!,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        return `https://drive.google.com/uc?export=view&id=${response.data.id}`;
    } catch (error) {
        console.error('HIBA a Drive feltöltésnél:', error);
        throw new Error(`Drive feltöltés sikertelen: ${(error as Error).message}`);
    }
}

// VIP Regisztrációs séma
const vipRegistrationSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    licensePlate: { type: String, required: true },
    carType: { type: String, required: true },
    carImages: [{ type: String }],
    interiorImage: { type: String },
    carStory: { type: String, required: true },
    privacyAccepted: { type: Boolean, required: true },
    registrationDate: { type: Date, default: Date.now }
});

const VIPRegistration = mongoose.model('VIPRegistration', vipRegistrationSchema);

// VIP regisztrációs végpont
app.post('/api/vip-registration',
    upload.fields([
        { name: 'carImage1', maxCount: 1 },
        { name: 'carImage2', maxCount: 1 },
        { name: 'carImage3', maxCount: 1 },
        { name: 'carImage4', maxCount: 1 },
        { name: 'interiorImage', maxCount: 1 }
    ]),
    async (req: Request, res: Response) => {
        try {
            const {
                firstname,
                lastname,
                email,
                phone,
                licenseplate,
                cartype,
                notes,
                privacy
            } = req.body;

            if (!firstname || !lastname || !email || !phone || !licenseplate || !cartype || !notes || !privacy) {
                return res.status(400).json({
                    success: false,
                    message: 'Minden kötelező mezőt ki kell tölteni!'
                });
            }

            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const carImages = [];
            const imageFields = ['carImage1', 'carImage2', 'carImage3', 'carImage4'];
            
            for (const field of imageFields) {
                if (files[field] && files[field][0]) {
                    try {
                        const fileUrl = await uploadToDrive(files[field][0]);
                        carImages.push(fileUrl);
                    } catch (uploadError) {
                        console.error('Hiba a feltöltés során:', uploadError);
                        throw uploadError;
                    }
                }
            }

            let interiorImage = '';
            if (files['interiorImage'] && files['interiorImage'][0]) {
                interiorImage = await uploadToDrive(files['interiorImage'][0]);
            }

            const newRegistration = new VIPRegistration({
                firstName: firstname,
                lastName: lastname,
                email,
                phone,
                licensePlate: licenseplate,
                carType: cartype,
                carImages,
                interiorImage,
                carStory: notes,
                privacyAccepted: privacy === 'on'
            });

            await newRegistration.save();

            // Email küldése Gmail API-val
            try {
                await sendEmail(
                    email,
                    'Köszönjük regisztrációdat!',
                    `
                        <h1>Köszönjük, hogy regisztráltál a HéCarFest VIP szektorba!</h1>
                        <p>Kedves ${firstname} ${lastname},</p>
                        <p>Megkaptuk regisztrációd, hamarosan értesítünk a további információkról.</p>
                        <p><strong>Regisztrációs adataid:</strong></p>
                        <ul>
                            <li>Név: ${firstname} ${lastname}</li>
                            <li>Email: ${email}</li>
                            <li>Rendszám: ${licenseplate}</li>
                            <li>Autó típusa: ${cartype}</li>
                        </ul>
                        <p>Üdvözlettel,<br>HéCarFest csapata</p>
                    `
                );
                console.log(`Visszaigazoló email elküldve: ${email}`);
            } catch (emailError) {
                console.error('Hiba email küldéskor:', emailError);
            }

            res.status(201).json({
                success: true,
                message: 'Sikeres regisztráció! Hamarosan értesítünk e-mailben.'
            });
        } catch (error) {
            console.error('Regisztrációs hiba:', error);
            res.status(500).json({
                success: false,
                message: 'Hiba történt a regisztráció során',
                error: (error as Error).message
            });
        }
    }
);

// Token eseményfigyelő
oauth2Client.on('tokens', (tokens: { refresh_token?: string | null; access_token?: string | null }) => {
    if (tokens.refresh_token) {
        console.log('Frissítő token:', tokens.refresh_token);
    }
    console.log('Access token:', tokens.access_token);
});

// Admin felhasználó séma
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  });


const Admin = mongoose.model('Admin', adminSchema);

  // JWT titkos kulcs
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Admin bejelentkezési végpont
app.post('/api/admin/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Felhasználónév és jelszó megadása kötelező' });
      }
      
      // Ellenőrizzük a felhasználót (ez csak példa, élesben használj valódi adatbázist)
      const admin = await Admin.findOne({ username });
      
      if (!admin || !(await bcrypt.compare(password, admin.password))) {
        return res.status(401).json({ success: false, message: 'Hibás felhasználónév vagy jelszó' });
      }
      
      // JWT token generálása
      const token = jwt.sign({ username: admin.username }, JWT_SECRET, { expiresIn: '8h' });
      
      res.json({ success: true, token });
    } catch (error) {
      console.error('Bejelentkezési hiba:', error);
      res.status(500).json({ success: false, message: 'Szerverhiba történt' });
    }
  });


  app.use(cors({
    origin: 'http://localhost:4200', // vagy az Angular alkalmazásod URL-je
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

//   // Middleware az admin jogosultság ellenőrzésére
// function verifyAdminToken(req: Request, res: Response, next: NextFunction) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(401).json({ success: false, message: 'Hiányzó vagy érvénytelen token' });
//     }

//     const token = authHeader.split(' ')[1];

//     try {
//         const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
//         (req as any).admin = decoded;
//         next();
//     } catch (err) {
//         return res.status(403).json({ success: false, message: 'Érvénytelen vagy lejárt token' });
//     }
// }

// // VIP regisztrációk lekérdezése admin számára
// app.get('/api/admin/registrations', verifyAdminToken, async (req: Request, res: Response) => {
//     try {
//         const registrations = await VIPRegistration.find().sort({ registrationDate: -1 });
//         res.json({ success: true, registrations });
//     } catch (err) {
//         console.error('Hiba a regisztrációk lekérésekor:', err);
//         res.status(500).json({ success: false, message: 'Nem sikerült lekérni a regisztrációkat' });
//     }
// });

// Middleware a JWT token ellenőrzéséhez
function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);
    
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      (req as any).user = user;
      next();
    });
  }

  function requireAdmin(req: { session: { user: { isAdmin: any; }; }; }, res: { redirect: (arg0: string) => void; }, next: () => void) {
    if (req.session && req.session.user && req.session.user.isAdmin) {
      next();
    } else {
      res.redirect('/admin/registration');
    }
  }


  // Regisztrációk lekérdezése
app.get('/api/admin/registrations', authenticateToken, async (req: Request, res: Response) => {
    try {
      const registrations = await VIPRegistration.find().sort({ registrationDate: -1 });
      res.json(registrations);
    } catch (error) {
      console.error('Regisztrációk lekérdezése sikertelen:', error);
      res.status(500).json({ message: 'Hiba történt a regisztrációk lekérdezése során' });
    }
  });
  
  // Regisztráció törlése
  app.delete('/api/admin/registrations/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await VIPRegistration.findByIdAndDelete(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Regisztráció törlése sikertelen:', error);
      res.status(500).json({ message: 'Hiba történt a regisztráció törlése során' });
    }
  });


  // Kezdeti admin felhasználó létrehozása (csak fejlesztéshez)
async function createInitialAdmin() {
    try {
      const adminCount = await Admin.countDocuments();
      if (adminCount === 0) {
        const hashedPassword = await bcrypt.hash('hecarfest2k25', 10);
        await Admin.create({
          username: 'hecarfest',
          password: hashedPassword
        });
        console.log('Alapértelmezett admin felhasználó létrehozva');
      }
    } catch (error) {
      console.error('Hiba az admin felhasználó létrehozásakor:', error);
    }
  }
  
  // Szerver indításakor admin létrehozása
  createInitialAdmin();


// Szerver indítása
app.listen(PORT, () => {
    console.log(`A szerver fut a ${PORT} porton`);
});