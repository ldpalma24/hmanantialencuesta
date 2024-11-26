document.addEventListener("DOMContentLoaded", function () {
  let currentStep = 0;
  const steps = document.querySelectorAll(".step");
  const nextBtns = document.querySelectorAll(".next-btn");
  const prevBtns = document.querySelectorAll(".prev-btn");
  
  // Muestra la primera sección al iniciar
  showStep(currentStep);

  // Función para mostrar el paso actual
  function showStep(stepIndex) {
    steps.forEach((step, index) => {
      step.classList.remove("active");
      if (index === stepIndex) {
        step.classList.add("active");
      }
    });
    window.scrollTo(0, 0); // Desplazarse hacia arriba al cambiar de paso
  }

  // Función para avanzar al siguiente paso
  function nextStep() {
    if (currentStep < steps.length - 1) {
      const current = steps[currentStep];
      const next = steps[currentStep + 1];
      
      current.classList.add("fall");
      
      setTimeout(() => {
        current.classList.remove("active", "fall");
        next.classList.add("active", "appear");
        
        setTimeout(() => {
          next.classList.remove("appear");
        }, 500);
      }, 1000);
      
      currentStep++;
    }
  }

  // Función para regresar al paso anterior
  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  }

  // Agregar eventos a los botones "Siguiente"
  nextBtns.forEach(btn => {
    btn.addEventListener("click", nextStep);
  });

  // Agregar eventos a los botones "Anterior"
  prevBtns.forEach(btn => {
    btn.addEventListener("click", prevStep);
  });

  // Manejar el envío del formulario
  const apiUrl = "https://prueba-backend-roan.vercel.app/api/survey";

  document.getElementById("surveyForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Obtener la respuesta del usuario
    const response = document.getElementById("response").value;

    // Enviar los datos al backend
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ response }), // Enviar respuesta en formato JSON
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Error en la respuesta del servidor");
        }
        return response.json();
      })
      .then(data => {
        console.log("Success:", data);
        alert("Response saved: " + data.message);
      })
      .catch(error => {
        console.error("Error:", error);
        alert("Ocurrió un error al guardar la respuesta.");
      });
  });
});
