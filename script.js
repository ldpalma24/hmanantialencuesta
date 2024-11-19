document.addEventListener("DOMContentLoaded", function() {
  let currentStep = 0;
  const steps = document.querySelectorAll(".step");
  const nextBtns = document.querySelectorAll(".next-btn");
  const prevBtns = document.querySelectorAll(".prev-btn");
  showStep(currentStep); // Muestra la primera sección

  function showStep(stepIndex) {
    steps.forEach((step, index) => {
      step.classList.remove("active");
      if (index === stepIndex) {
        step.classList.add("active");
      }
    });
    window.scrollTo(0, 0); // Desplazarse hacia arriba al cambiar de paso
  }

  function nextStep() {
    if (currentStep < steps.length - 1) {
      const current = steps[currentStep];
      const next = steps[currentStep + 1];
      current.classList.add('fall');
      setTimeout(() => {
        current.classList.remove('active', 'fall');
        next.classList.add('active', 'appear');
        setTimeout(() => {
          next.classList.remove('appear');
        }, 500);
      }, 1000);
      currentStep++;
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  }

  nextBtns.forEach(btn => {
    btn.addEventListener("click", nextStep);
  });

  prevBtns.forEach(btn => {
    btn.addEventListener("click", prevStep);
  });

  // Manejar el envío del formulario
  const form = document.getElementById("surveyForm");
  form.addEventListener("submit", async function(event) {
    event.preventDefault();
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    console.log('Datos del formulario:', data);
    try {
      const response = await fetch('https://hmanantialencuesta.vercel.app//submit-survey', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      console.log('Success:', result);
      // Redirigir después de enviar correctamente
      alert('Encuesta enviada con éxito');
      window.location.href = 'https://www.instagram.com/hotelmanantialvalencia/';
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al enviar la encuesta');
    }
  });
});
