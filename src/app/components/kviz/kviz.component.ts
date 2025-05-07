import { Component, HostListener, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-kviz',
  templateUrl: './kviz.component.html',
  styleUrls: ['./kviz.component.scss'],
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None
})
export class KvizComponent {
  // ... (egyéb változók)
  showQuizModal = false;
  quizDropdownOpen = false;
  currentQuiz = 1;

  // Kvíz változók
  quizQuestions: any[] = [];
  currentQuestion = 0;
  selectedOption: number | null = null;
  score = 0;
  timerInterval: any;
  timeLeft = 10;
  timeExpired = false;
  timerStarted = false;

  constructor(private http: HttpClient, private router: Router) {
    // Inicializáljuk a kvíz kérdéseket
    this.quizQuestions = [
      {
        id: 1,
        questions: [
          {
            question: "Melyik autómárka gyártja a „Mustang” modellt?",
            options: ["Chevrolet", "Ford", "Dodge", "Tesla"],
            answer: 1
          },
          {
            question: "Melyik autómárka logója található a képen?",
            options: ["Tesla", "Lada", "Suzuki", "Bentley"],
            answer: 3,
            image: "https://cdn.freebiesupply.com/logos/large/2x/bentley-motors-2-logo-black-and-white.png"
          },
          {
            question: "Melyik országban található a Ferrari központja?",
            options: ["Németország", "Olaszország", "Franciaország", "Japán"],
            answer: 1
          },
          {
            question: "Melyik évben mutatták be a Tesla első autóját, a Roadstert?",
            options: ["2005", "2006", "2008", "2010"],
            answer: 2
          },
          {
            question: "Milyen logo látható a képen?",
            options: ["Audi", "BMW", "Mercedes-Benz", "Brabus"],
            answer: 3,
            image: "https://i.ebayimg.com/images/g/gIoAAOSw04ddF8iU/s-l1200.jpg"
          },
          {
            question: "Melyik brit autómárka szerepel a James Bond filmek legtöbb részében?",
            options: ["Jaguar", "Rolls-Royce", "Bentley", "Aston Martin"],
            answer: 3
          },
          {
            question: "Melyik híres pálya ad otthont a Le Mans-i 24 órás versenynek?",
            options: ["Nürburgring", "Circuit de la Sarthe", "Silverstone", "Monza"],
            answer: 1
          },
          {
            question: "Mi a neve az Audi önvezető technológiájának?",
            options: ["Pilot Assist", "Autopilot", "Drive Pilot", "IntelliDrive"],
            answer: 2
          },
          {
            question: "Melyik autógyártó alkotta meg a híres \"Countach\" szupersportautót?",
            options: ["Lamborghini", "Ferrari", "Koenigsegg", "McLaren"],
            answer: 0
          },
          {
            question: "Milyen motorral rendelkezik a legtöbb Formula–1-es autó 2024-ben?",
            options: ["2.4 literes V10", "1.6 literes turbó V6 hibrid", "2.0 literes soros négyhengeres", "3.5 literes V8"],
            answer: 1
          }
        ]
      },







      {
        id: 2,
        questions: [
          {
            question: "Melyik autómárka használta először a „VTEC” változó szelepvezérlést?",
            options: ["Toyota", "Nissan", "Honda", "Mazda"],
            answer: 2
          },
          {
            question: "Melyik országban alapították a Volvo autómárkát?",
            options: ["Svédország", "Németország", "Franciaország", "Finnország"],
            answer: 0
          },
          {
            question: "Melyik az alábbiak közül egy teljesen elektromos autómárka?",
            options: ["Rivian", "Infiniti", "Acura", "Lotus"],
            answer: 0
          },
          {
            question: "Melyik autómárka logóját látjuk a képen?",
            image: "https://barkas.online/wp-content/uploads/2020/11/barkas_R.png",
            options: ["Varburg", "Zaporozhets", "Barkas", "Trabant"],
            answer: 2
          },
          {
            question: "Melyik volt a Bugatti csúcsteljesítményű autója (2024-ben)?",
            options: [
              "Bugatti Veyron Super Sport",
              "Bugatti Chiron Super Sport 300+",
              "Bugatti Divo",
              "Bugatti Bolide"
            ],
            answer: 1
          },
          {
            question: "Melyik évben alapították a Porsche autómárkát?",
            options: ["1925", "1931", "1946", "1953"],
            answer: 1
          },
          {
            question: "Melyik gyártó készítette az első szériagyártású Wankel-motoros autót?",
            options: ["Mazda", "Citroën", "Mercedes-Benz", "BMW"],
            answer: 0
          },
          {
            question: "Melyik autómodellből készült a világon a legtöbb darab?",
            options: ["Volkswagen Golf", "Ford Model T", "Volkswagen Beetle", "Toyota Corolla"],
            answer: 3
          },
          {
            question: "Melyik autómárka logóját láthatjuk a képen?",
            image: "https://i.etsystatic.com/38881100/r/il/45e678/4772970676/il_fullxfull.4772970676_nus8.jpg",
            options: ["BMW", "Nissan", "Maserati", "Mercedes"],
            answer: 2
          },
          {
            question: "Mi az Aston Martin egyik legismertebb modellje, amelyet James Bond is vezetett?",
            options: ["Aston Martin Vantage", "Aston Martin DB5", "Aston Martin Vanquish", "Aston Martin DBS"],
            answer: 1
          }
        ]
      },

      {
        id: 3,
        questions: [
          {
            question: "Melyik autómárka gyártja a „Civic” modellt?",
            options: ["Mazda", "Honda", "Toyota", "Subaru"],
            answer: 1
          },
          {
            question: "Melyik autómárka logoját láthatjuk a képen?",
            image: "https://w7.pngwing.com/pngs/921/602/png-transparent-gaz-volga-car-gaz-24-bmw-car-emblem-logo-car.png",
            options: ["Lada", "Skoda", "Moskvich", "GAZ-21 Volga"],
            answer: 3
          },
          {
            question: "Mi volt az első modell, amelyet a Tesla teljesen elektromos autóként mutatott be?",
            options: ["Model X", "Model S", "Roadster", "Model 3"],
            answer: 1
          },
          {
            question: "Melyik cég gyártotta az ikonikus McLaren F1 szupersportautó motorját?",
            options: ["Mercedes-Benz", "Ferrari", "BMW", "Honda"],
            answer: 2
          },
          {
            question: "Mi a Nissan teljesítményorientált almárkája?",
            options: ["TRD", "AMG", "Nismo", "STI"],
            answer: 2
          },
          {
            question: "Melyik autómárka használja a „M” jelölést a nagy teljesítményű modelljeinél?",
            options: ["Mercedes-Benz", "BMW", "Audi", "Lexus"],
            answer: 1
          },
          {
            question: "Melyik évben vezették be a Ford Model T-t, az első tömeggyártott autót?",
            options: ["1899", "1908", "1915", "1921"],
            answer: 1
          },
          {
            question: "Melyik autómárka hozta létre a híres „Skyline” modellt?",
            options: ["Honda", "Toyota", "Nissan", "Mazda"],
            answer: 2
          },
          {
            question: "Milyen logót láthatunk a képen?",
            image: "https://static.wixstatic.com/media/f2bf43_67b18fb0d7ed45b59e828044d49fd8b7~mv2.png",
            options: ["Cupra", "Seat", "Fiat", "Renault"],
            answer: 0
          },
          {
            question: "Melyik az alábbiak közül egy híres francia autómárka?",
            options: ["Opel", "Renault", "Fiat", "Seat"],
            answer: 1
          }
        ]
      },

      {
        id: 4,
        questions: [
          {
            question: "Milyen autómodell volt a főszereplő Herbie a Disney-filmekben?",
            options: ["Volkswagen Golf", "Volkswagen Beetle", "Mini Cooper", "Fiat 500"],
            answer: 1
          },
          {
            question: `
            <div style="text-align:center;">
            <br>
            Melyik autómárka logója látható a képen?
            <br>
            <img src='https://1000logos.net/wp-content/uploads/2020/04/Koenigsegg-Logo.jpg' alt='Koenigsegg Logo' 
            style="max-height:150px; display: block; margin: 0 auto;"><br>`,
            options: ["Koenigsegg", "Pagani", "Bugatti", "Lamborghini"],
            answer: 0
          },
          {
            question: "Melyik versenysorozatban szerepelnek kizárólag teljesen elektromos autók?",
            options: ["DTM", "WRC", "Formula E", "NASCAR"],
            answer: 2
          },
          {
            question: "Melyik híres olasz dizájnerstúdió készített karosszéria-terveket több Ferrari és Alfa Romeo számára is?",
            options: ["Pininfarina", "Italdesign", "Bertone", "Zagato"],
            answer: 0
          },
          {
            question: "Melyik amerikai autógyártó gyártotta az 1967-es Shelby GT500-as modellt?",
            options: ["Chevrolet", "Dodge", "Ford", "Pontiac"],
            answer: 2
          },
          {
            question: "Mi volt a Toyota hibrid rendszerű modelljének (Prius) bemutatási éve világszinten?",
            options: ["1995", "1997", "2000", "2002"],
            answer: 1
          },
          {
            question: "Mi volt az első tömeggyártott autó, amely elérte a 300 km/h végsebességet?",
            options: ["Ferrari F40", "Porsche 959", "Bugatti EB110", "Jaguar XJ220"],
            answer: 3
          },
          {
            question: "Melyik autómárkának van egy „Raptor” nevű off-road pickup modellje?",
            options: ["RAM", "Ford", "Chevrolet", "GMC"],
            answer: 1
          },
          {
            question: `
            <div style="text-align:center;">
            <br>
            Melyik autómárka logója látható a képen?
            <br>
            <img src='https://www.battery.co.za/wp-content/uploads/2024/06/SAAB.png' alt='Audi Logo' 
            style="max-height:150px; display: block; margin: 0 auto;">
            </div>`,
            options: ["SAAB", "Vauxhall", "MG", "Subaru"],
            answer: 0
          },
          {
            question: "Milyen szám szerepelt Villám Mcqeen oldalán a Verdák c. mesében?",
            options: ["59", "95", "75", "99"],
            answer: 1
          }
        ]
      },
      {
        id: 5,
        questions: [
          {
            question: "Milyen autója volt Jessie-nek a Halálos Iramban című filmben?",
            options: ["Volkswagen Arteon", "Volkswagen Scirocco", "Volkswagen Corrado", "Volkswagen Jetta"],
            answer: 3
          },
          {
            question: `
              <div style="text-align:center;">
                <br>
                Melyik autómárka logója látható a képen?
                <br>
                <img src="https://upload.wikimedia.org/wikipedia/sco/1/18/Vauxhall_logo_2019.svg" alt="Vauxhall Logo" style="max-height:150px; display: block; margin: 0 auto;">
              </div>
            `,
            options: ["Opel", "Vauxhall", "Dacia", "Lotus"],
            answer: 1
          },
          {
            question: "Mi a neve az Audi önvezető technológiájának?",
            options: ["Pilot Assist", "Autopilot", "Drive Pilot", "IntelliDrive"],
            answer: 2
          },
          {
            question: "Melyik autógyártó alkotta meg a híres \"Countach\" szupersportautót?",
            options: ["Lamborghini", "Ferrari", "Koenigsegg", "McLaren"],
            answer: 0
          },
          {
            question: "Milyen motorral rendelkezett a legtöbb Formula–1-es autó 2024-ben?",
            options: ["2.4 literes V10", "1.6 literes turbó V6 hibrid", "2.0 literes soros négyhengeres", "3.5 literes V8"],
            answer: 1
          },
          {
            question: "Melyik márka készítette a híres „Quattroporte” luxus sportlimuzint?",
            options: ["Alfa Romeo", "Maserati", "Lancia", "Jaguar"],
            answer: 1
          },
          {
            question: "Melyik cég tulajdonában van jelenleg a brit MINI márka?",
            options: ["Mercedes-Benz", "Volkswagen", "BMW", "Ford"],
            answer: 2
          },
          {
            question: "Milyen hajtást alkalmaz a legtöbb Subaru személyautó?",
            options: ["Elsőkerék-hajtás", "Hátsókerék-hajtás", "Összkerékhajtás", "Elektromos hajtás"],
            answer: 2
          },
          {
            question:  `<div style="text-align:center;"><img src='https://preview.redd.it/fzijohhjyy291.png?width=339&format=png&auto=webp&s=31617f94856bde699929d12f03127fdc0251085d' 
            class='logo-img' style="max-height:150px; display: block; margin: 0 auto;"><br>Melyik autómárka logója ez?",
            </div>
            `,
            options: ["Lamborghini", "Ferrari", "Koenig", "Suzuki"],
            answer: 0 
            ,
          },
          {
            question: "Melyik autómárka neve jelentése magyarul: „nép autója”?",
            options: ["Volvo", "Peugeot", "Volkswagen", "Citroën"],
            answer: 2
          }

        ]
      },
      {
        id: 6,
        questions: [
          {
            question: "Milyen autóval indultak útnak a Cool Túra című filmben?",
            options: ["Ford Fiesta", "Ford Mondeo", "Ford Crown Victoria", "Ford Mustang"],
            answer: 2
          },
          {
            question: "Melyik márka logója látható ezen a képen?",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0ldwCJqmRR0A6MXaPAxgDHFnDPpF89Lflqg&s",
            options: ["Ferrari", "Alfa Romeo", "Skoda", "Lamborghini"],
            answer: 1
          },
          {
            question: "Melyik autó nyerte meg a 2023-as „Év Autója” díjat Európában?",
            options: ["Kia EV6", "Peugeot 308", "Jeep Avenger", "Volkswagen ID.4"],
            answer: 2
          },
          {
            question: "Melyik márka logója ábrázol egy kék-fehér propellert?",
            options: ["BMW", "Subaru", "Bugatti", "Suzuki"],
            answer: 0
          },
          {
            question: "Milyen típusú motor jellemző a Porsche 911 modellekre?",
            options: ["Soros négyhengeres", "Boxermotor", "V8", "Elektromotor"],
            answer: 1
          },
          {
            question: "Melyik országban található a Koenigsegg szupersportautókat gyártó vállalat?",
            options: ["Svédország", "Németország", "Dánia", "Kanada"],
            answer: 0
          },
          {
            question: "Melyik autó volt a Tesla első SUV modellje?",
            options: ["Model Y", "Model X", "Model 3", "Cybertruck"],
            answer: 1
          },
          {
            question: "Melyik gyártó hozta létre a híres „Impreza WRX STI” modellt?",
            options: ["Toyota", "Subaru", "Nissan", "Mitsubishi"],
            answer: 1
          },
          {
            question: "Melyik márka logója látható ezen a képen?",
            image: "https://1000logos.net/wp-content/uploads/2020/04/Cadillac-Logo-2000.png",
            options: ["Chrysler", "Caddilac", "Citroen", "Chevrolet"],
            answer: 1
          },
          {
            question: "Melyik cég gyártotta a híres „E-Type” sportautót az 1960-as években?",
            options: ["Aston Martin", "Lotus", "Jaguar", "MG"],
            answer: 2
          }
        ]

      },
      {
        id: 7,
        questions: [
          {
            question: "Melyik filmben látható a híres 'DeLorean' időgépként?",
            options: ["Fast & Furious", "Vissza a jövőbe", "Mad Max", "Baby Drive"],
            answer: 1
          },
          {
            question: "Milyen autóban verte egymást bucira Deadpool és Rozsomák?",
            options: ["Chevrolet Soburban", "Honda Odyssey", "Kia Telluride", "Kia Carnival"],
            answer: 1
          },
          {
            question: "Milyen autó csomagtartójában találták meg MR. Chow-ot a Másnaposok című filmben?",
            options: ["1971 Mercedes-Benz 280 SE", "1959 BMW 503 Cabriolet", "1959 Cadillac Series 62 Convertible", " 1965 Mercedes-Benz 220 SE"],
            answer: 3
          },
          {
            question: "Hány Km/h-val mérték be Daniel-t a Taxi című filmben a rendőrök?",
            options: ["306", "199", "406", "257"],
            answer: 0
          },
          {
            question: "Milyen autóval közlekedett legtöbbször Tony Stark a Bosszúállók című filmekben??",
            options: ["Porsche 911 Turbo S", "Ferrari 488 GTB", "Audi R8", "McLaren 720S"],
            answer: 2
          },
          {
            question: "Melyik filmben szerepel a híres 'Eleanor' Mustang, amelyet Nicolas Cage vezet?",
            options: ["Gone in 60 Seconds", "Fast & Furious", "Drive", "The Transporter"],
            answer: 0
          },
          {
            question: "Mi volt a híres sportautó, amit a 'The Italian Job' filmben használtak?",
            options: ["Ferrari 360 Modena", "Mini Cooper", "Lamborghini Gallardo", "Porsche 911"],
            answer: 1
          },
          {
            question: "Melyik filmben szerepel a 'Ford GT40' versenyautó?",
            options: ["Rush", "Ford v Ferrari", "Fast & Furious", "Days of Thunder"],
            answer: 1
          },
          {
            question: "Melyik filmben látható a 'Batmobile'?",
            options: ["The Dark Knight", "Iron Man", "Spider-Man", "The Avengers"],
            answer: 0
          },
          {
            question: "Milyen autó szerepelt a Scoby Doo-ban?",
            options: ["1963 Ford Ecoline Van", "1961 Chevrolet Corvair Greenbrier ", "1967 Volkswagen Type 2 Bus", "1964 Dodge A100 Van"],
            answer: 0
          },
          {
            question: "Melyik szám szerepelt Herbie oldalán?",
            options: ["51", "52", "53", "55"],
            answer: 2
          },
          {
            question: "Melyik autó márka szerepelt a Szupercsapat sorozatban, mint a főszereplő járműve?",
            options: ["Chevrolet", "GMC", "Dodge", "Toyota"],
            answer: 1
          },
          {
            question: "Melyik autó szerepelt a 'Mad Max: Fury Road' című filmben?",
            options: ["Ford Mustang", "Mercedes-Benz", "Interceptor (custom Ford Falcon)", "Dodge Charger"],
            answer: 2
          },
          {
            question: "Melyik filmben látható a híres 'Porsche 917' versenyautó, amit Steve McQueen vezet?",
            options: ["Le Mans", "Rush", "The Fast and the Furious", "Days of Thunder"],
            answer: 0
          },
          {
            question: "Milyen autót vezetett Lucy az 50 első randi című filmben?",
            options: ["Jeep CJ-5", "Ford Bronco", "Volkswagen Thing", "Toyota Land Cruiser"],
            answer: 2
          }
        ]
      }
    ];
  }

  // Kvíz dropdown kezelése
  toggleQuizDropdown(): void {
    this.quizDropdownOpen = !this.quizDropdownOpen;
  }

  // Kvíz modal megnyitása
  openQuizModal(quizId: number): void {
    this.currentQuiz = quizId;
    this.showQuizModal = true;
    this.quizDropdownOpen = false;
    this.resetQuiz();
    setTimeout(() => this.loadQuestion(), 100);
  }

  // Kvíz modal bezárása
  closeQuizModal(): void {
    this.showQuizModal = false;
    this.clearTimer();
  }

  // Kvíz logika
  resetQuiz(): void {
    this.currentQuestion = 0;
    this.score = 0;
    this.selectedOption = null;
    this.timeLeft = 10;
    this.timeExpired = false;
    this.timerStarted = false;
  }

  loadQuestion(): void {
    this.clearTimer();
    this.timeLeft = 10;
    this.timeExpired = false;
    this.selectedOption = null;
    this.timerStarted = false;
    this.updateTimerDisplay();

    const quizContent = document.getElementById('quizContent');
    const feedback = document.getElementById('feedback');
    if (feedback) feedback.textContent = "";
    this.toggleElementVisibility('nextBtn', false);
    this.toggleElementVisibility('startTimerBtn', true);

    quizContent?.classList.remove('fade-in');
    quizContent?.classList.add('fade-out');

    setTimeout(() => {
      const questions = this.quizQuestions.find(q => q.id === this.currentQuiz)?.questions || [];
      const q = questions[this.currentQuestion];

      if (!q) return;

      let html = `<div class="question" style="margin-bottom: 20px; font-size: 28px;">${this.currentQuestion + 1}. ${q.question}</div><div class="options" style="display: flex; flex-direction: column; align-items: center; margin-top: 20px;">`;

      if (q.image) {
        html += `<img src="${q.image}" alt="Logo" style="max-width: 300px; margin-bottom: 20px;" />`;
      }

      q.options.forEach((option: string, index: number) => {
        html += `<button class="option-btn" style="background-color: #333; color: #ffa500; border: 3px solid transparent; border-radius: 15px; padding: 15px 30px; margin: 12px 0; font-size: 24px; cursor: pointer; transition: background-color 0.3s, border-color 0.3s; width: 80%; max-width: 500px;" 
               (click)="selectOption($event, ${index})">${option}</button>`;
      });
      html += `</div>`;
      if (quizContent) quizContent.innerHTML = html;

      // Eseménykezelők hozzáadása
      setTimeout(() => {
        document.querySelectorAll('.option-btn').forEach((btn, index) => {
          btn.addEventListener('click', (event) => this.selectOption(event, index));
        });
      }, 0);

      quizContent?.classList.remove('fade-out');
      quizContent?.classList.add('fade-in');
    }, 400);
  }

  startTimer(): void {
    if (this.timerStarted) return;
    this.timerStarted = true;
    this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    this.toggleElementVisibility('startTimerBtn', false);
  }

  updateTimer(): void {
    this.timeLeft--;
    this.updateTimerDisplay();

    if (this.timeLeft <= 0) {
      this.clearTimer();
      this.timeExpired = true;
      const feedback = document.getElementById('feedback');
      if (feedback) feedback.textContent = "⏰ Lejárt az idő!";
    }
  }

  updateTimerDisplay(): void {
    const timer = document.getElementById('timer');
    if (timer) {
      timer.textContent = `⏳ Idő: ${this.timeLeft} mp`;
      timer.style.color = this.timeLeft > 7 ? "#00FF00" : this.timeLeft > 4 ? "#FFFF00" : "#FF0000";
    }
  }
  // selectedOption: number | null = null;
  correctAnswer: number | null = null;

  // A selectOption metódus módosítása
  selectOption(event: Event, index: number): void {
    if (this.selectedOption !== null) return;
    this.selectedOption = index;
    const button = event.target as HTMLElement;
    button.classList.add('selected');

    // Válasz ellenőrzése
    const questions = this.quizQuestions.find(q => q.id === this.currentQuiz)?.questions || [];
    const correctAnswer = questions[this.currentQuestion]?.answer;
    this.correctAnswer = correctAnswer;

    // Válasz visszajelzés megjelenítése
    setTimeout(() => {
      this.revealAnswer();
    }, 2500);
  }

  // Az új revealAnswer metódus
  revealAnswer(): void {
    const questions = this.quizQuestions.find(q => q.id === this.currentQuiz)?.questions || [];
    const correctAnswer = questions[this.currentQuestion]?.answer;
    const optionButtons = document.querySelectorAll('.option-btn');

    optionButtons.forEach((btn: any, idx: number) => {
      btn.disabled = true;
      // Mindig megjelenítjük a helyes választ zölden
      if (idx === correctAnswer) {
        btn.classList.add('correct');
      }
      // Ha a választott válasz rossz, akkor azt pirosra színezzük
      if (idx === this.selectedOption && this.selectedOption !== correctAnswer) {
        btn.classList.add('wrong');
      }
    });

    // Visszajelzés megjelenítése
    const feedback = document.getElementById('feedback');
    if (feedback) {
      if (this.selectedOption === correctAnswer) {
        feedback.textContent = "✅ Helyes válasz!";
        this.score++;
      } else {
        feedback.textContent = `❌ Rossz válasz!`;
      }
    }

    this.toggleElementVisibility('nextBtn', true);
  }

  nextQuestion(): void {
    this.currentQuestion++;
    const questions = this.quizQuestions.find(q => q.id === this.currentQuiz)?.questions || [];

    if (this.currentQuestion < questions.length) {
      this.loadQuestion();
    } else {
      this.showFinalScore();
    }
  }

  showFinalScore(): void {
    this.clearTimer();
    const quizContent = document.getElementById('quizContent');
    const feedback = document.getElementById('feedback');
    const timer = document.getElementById('timer');

    if (quizContent) {
      const questions = this.quizQuestions.find(q => q.id === this.currentQuiz)?.questions || [];
      quizContent.innerHTML = `<h2 class="text-3xl text-orange-500 mb-4">🌟 Végeredmény: ${this.score}/${questions.length} 🌟</h2>`;
    }
    if (feedback) feedback.textContent = "";
    if (timer) timer.textContent = "";
    this.toggleElementVisibility('nextBtn', false);
    this.toggleElementVisibility('restart', true);
    this.toggleElementVisibility('startTimerBtn', false);
  }

  restartQuiz(): void {
    this.resetQuiz();
    this.loadQuestion();
    this.toggleElementVisibility('restart', false);
  }

  clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  toggleElementVisibility(id: string, show: boolean): void {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = show ? 'block' : 'none';
    }
  }

  // Billentyűzet események kezelése
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.showQuizModal) return;

    // Válaszok (1, 2, 3, 4)
    if (['1', '2', '3', '4'].includes(event.key)) {
      const index = parseInt(event.key) - 1;
      const buttons = document.querySelectorAll('.option-btn');
      if (index >= 0 && index < buttons.length) {
        this.selectOption({ target: buttons[index] } as any, index);
      }
    }

    // Következő kérdés (Jobb nyíl)
    if (event.key === 'ArrowRight') {
      const nextBtn = document.getElementById('nextBtn');
      if (nextBtn && nextBtn.style.display === "block") {
        this.nextQuestion();
      }
    }

    // Időzítő indítása (Space)
    if (event.key === 'm') {
      const startTimerBtn = document.getElementById('startTimerBtn');
      if (startTimerBtn && startTimerBtn.style.display === "block") {
        this.startTimer();
      }
    }
  }
}