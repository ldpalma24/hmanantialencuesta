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
  const apiUrl = "https://hmanantialencuesta.vercel.app/api/survey";

  document.getElementById("surveyForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Capturar los datos del formulario
    const surveyData = {
      nombre: document.querySelector('[name="nombre"]').value,
      nrohab: document.querySelector('[name="nrohab"]').value,
      check_in: document.querySelector('[name="check_in"]:checked')?.value,
      hab: document.querySelector('[name="hab"]:checked')?.value,
      bath: document.querySelector('[name="bath"]:checked')?.value,
      redp: document.querySelector('[name="redp"]:checked')?.value,
      manolo: document.querySelector('[name="manolo"]:checked')?.value,
      desay: document.querySelector('[name="desay"]:checked')?.value,
      rmserv: document.querySelector('[name="rmserv"]:checked')?.value,
      pool: document.querySelector('[name="pool"]:checked')?.value,
      check_out: document.querySelector('[name="check_out"]:checked')?.value,
      gneral: document.querySelector('[name="gneral"]:checked')?.value,
    };

    // Validar que todos los campos estén completos
    if (Object.values(surveyData).some(value => value === undefined || value === "")) {
      alert("Por favor, responde todas las preguntas antes de enviar.");
      return;
    }

    // Enviar los datos al backend
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(surveyData), // Enviar el objeto en formato JSON
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Error en la respuesta del servidor");
        }
        return response.json();
      })
      .then(data => {
        console.log("Success:", data);
        alert("Encuesta guardada exitosamente: " + data.message);
      })
      .catch(error => {
        console.error("Error:", error);
        alert("Ocurrió un error al guardar la encuesta.");
      });
  });
});
