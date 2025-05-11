// Módulo principal con encapsulación IIFE
(function() {
    // Estado global del aplicativo
    const state = {
      hearts: [],
      currentOpenHeart: null,
      overlay: null,
      audioContext: null,
      analyser: null,
      microphone: null
    };
  
    // Inicialización cuando el DOM está listo
    document.addEventListener('DOMContentLoaded', init);
  
    function init() {
      const flame = document.querySelector('.flame');
      const cake = document.querySelector('.birthday-cake');
      const message = document.querySelector('.message');
      
      flame.addEventListener('click', blowOutCandle);
      setupMicrophoneDetection();
    }
  
    function setupMicrophoneDetection() {
      if (!navigator.mediaDevices?.getUserMedia) return;
  
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          state.analyser = state.audioContext.createAnalyser();
          state.microphone = state.audioContext.createMediaStreamSource(stream);
          state.microphone.connect(state.analyser);
          state.analyser.fftSize = 256;
          
          detectBlowing();
        })
        .catch(err => {
          console.log("Acceso al micrófono no disponible:", err);
        });
    }
  
    function detectBlowing() {
      const bufferLength = state.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      function check() {
        state.analyser.getByteFrequencyData(dataArray);
        const total = dataArray.reduce((sum, value) => sum + value, 0);
        
        if (total > 5000) {
          blowOutCandle();
          state.microphone?.disconnect();
          state.audioContext?.close();
        } else {
          requestAnimationFrame(check);
        }
      }
      check();
    }
  
    function blowOutCandle() {
      document.querySelector('.birthday-cake').classList.add('blown');
      document.querySelector('.message').textContent = '¡Feliz Cumpleaños!';
  
      createSmokeEffect();
      launchConfetti();
      playBirthdaySong();
      setTimeout(showHearts, 1000);
    }
  
    function createSmokeEffect() {
      for(let i = 0; i < 5; i++) {
        setTimeout(() => {
          const smoke = document.createElement('div');
          smoke.className = 'smoke';
          smoke.style.left = `${50 + (Math.random() * 20 - 10)}%`;
          document.querySelector('.candle').appendChild(smoke);
          
          setTimeout(() => smoke.remove(), 3000);
        }, i * 300);
      }
    }
  
    function launchConfetti() {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  
    function playBirthdaySong() {
      const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-happy-birthday-song-464.mp3');
      audio.play().catch(e => console.log("Audio no reproducido:", e));
    }
    const heartPoems = [
        {
          title: "Deseos Para Ti",
          content: `Quiero que el cielo te abrace
      con su manto de estrellas,
      que la luna te acompañe
      y el sol te cubra de huellas.
      
      Que encuentres en cada camino
      flores donde pisar,
      y si alguna vez hay espinas,
      que sepan perdonar.
      
      Te deseo mariposas,
      atardeceres de oro,
      risas que nunca se apaguen
      y un corazón sonoro.
      
      Que la vida te regale
      lo que mereces tener:
      amor, salud y ese brillo
      que te hace florecer.`
        },
        {
          title: "Vuelos de Luz",
          content: `Que tus días sean canciones
      que alegren el amanecer,
      y las noches dulces versos
      para poderte tener.
      
      Que el viento lleve tu nombre
      a jardines de ilusión,
      y que cada nueva nube
      te regale su algodón.
      
      Que encuentres en la tormenta
      arcoíris por doquier,
      y que siempre, siempre brilles
      con tu luz de crisantem.`
        },
        {
          title: "Eterna Primavera",
          content: `Que tu vida sea un río
      de aguas claras y serenas,
      donde nadie rompa el hechizo
      de tus olas siempre buenas.
      
      Que abril florezca en enero
      para ti, mi dulce flor,
      que nunca falten abrazos,
      ni caricias, ni amor.
      
      Que los pájaros te canten
      sus trinos al despertar,
      y que cada nuevo camino
      te lleve a buen lugar.`
        }
      ];
      
      // Función showHearts actualizada
      function showHearts() {
        clearHearts();
      
        heartPoems.forEach((poem, index) => {
          const heart = document.createElement('div');
          heart.className = 'heart';
          heart.style.top = `${20 + (index * 25)}%`;
          heart.style.left = `${10 + (index * 30)}%`;
          heart.setAttribute('data-poem', JSON.stringify(poem));
          document.body.appendChild(heart);
          state.hearts.push(heart);
      
          setTimeout(() => heart.classList.add('active'), index * 300);
          heart.addEventListener('click', showPoemModal);
        });
      }
      
      // Nueva función para mostrar poemas
      function showPoemModal(event) {
        const poem = JSON.parse(event.currentTarget.getAttribute('data-poem'));
        
        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'poem-modal';
        modal.innerHTML = `
          <div class="poem-container">
            <h3>${poem.title}</h3>
            <div class="poem-content">${poem.content.replace(/\n/g, '<br>')}</div>
            <button class="close-btn">✕</button>
          </div>
        `;
        
        document.body.appendChild(modal);
        
        // Cerrar modal
        modal.querySelector('.close-btn').addEventListener('click', () => {
          modal.classList.add('fade-out');
          setTimeout(() => modal.remove(), 300);
        });
      }
   
  
    function handleHeartClick(e) {
      e.stopPropagation();
      if (state.currentOpenHeart) closeCurrentHeart();
      
      state.currentOpenHeart = e.currentTarget;
      state.overlay = createOverlay();
      state.currentOpenHeart.classList.add('zoomed');
    }
  
    function createOverlay() {
      const overlay = document.createElement('div');
      overlay.className = 'overlay active';
      overlay.addEventListener('click', closeCurrentHeart);
      document.body.appendChild(overlay);
      return overlay;
    }

    // Mostrar mensaje oculto después de 4 segundos
  setTimeout(() => {
    const message = document.querySelector('.hidden-message');
    message.classList.add('visible');
    
    // Configurar el link de YouTube
    document.querySelector('.youtube-link').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open('https://www.youtube.com/watch?v=owFjCHKikPY&ab_channel=sweetblueII', '_blank');
      e.target.style.transform = 'scale(1.3)';
      setTimeout(() => {
        e.target.style.transform = 'scale(1)';
      }, 300);
    });
  }, 4000);

  
    function closeCurrentHeart() {
      if (state.currentOpenHeart) {
        state.currentOpenHeart.classList.remove('zoomed');
        state.currentOpenHeart = null;
      }
      if (state.overlay) {
        state.overlay.remove();
        state.overlay = null;
      }
    }
  
    function animateHeart(heart, delayIndex) {
      setTimeout(() => heart.classList.add('active'), delayIndex * 300);
    }
  
    function clearHearts() {
      closeCurrentHeart();
      state.hearts.forEach(heart => heart.remove());
      state.hearts = [];
    }
  
    // Exponer solo lo necesario al ámbito global
    window.BirthdayApp = {
      blowOutCandle
    };
  })();

  // Botón Léeme
const readMeBtn = document.querySelector('.read-me-btn');
const messageModal = document.querySelector('.message-modal');
const closeModalBtn = document.querySelector('.close-modal');

readMeBtn.addEventListener('click', () => {
  messageModal.classList.add('active');
});

closeModalBtn.addEventListener('click', () => {
  messageModal.classList.remove('active');
});

// Cerrar al hacer clic fuera del contenido
messageModal.addEventListener('click', (e) => {
  if (e.target === messageModal) {
    messageModal.classList.remove('active');
  }
});