document.addEventListener("DOMContentLoaded", function () {
  let currentStep = 0;
  const steps = document.querySelectorAll(".step");
  const nextBtns = document.querySelectorAll(".next-btn");
  const prevBtns = document.querySelectorAll(".prev-btn");

  // Mostrar el primer paso al cargar la página
  showStep(currentStep);

  // Función para mostrar el paso actual y deshabilitar los campos no visibles
  function showStep(stepIndex) {
    steps.forEach((step, index) => {
      step.classList.toggle("active", index === stepIndex);
      step.querySelectorAll("input").forEach(input => input.disabled = index !== stepIndex);
    });
    window.scrollTo(0, 0); // Desplazarse hacia arriba al cambiar de paso
  }

  // Validar campos antes de avanzar
  function validateCurrentStep() {
    const currentInputs = steps[currentStep].querySelectorAll("input");
    return Array.from(currentInputs).every(input => input.checkValidity());
  }

  // Avanzar al siguiente paso
  function nextStep() {
    if (!validateCurrentStep()) {
      alert("Por favor, completa todos los campos requeridos antes de continuar.");
      return;
    }
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

  // Regresar al paso anterior
  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  }

  // Agregar eventos a los botones
  nextBtns.forEach(btn => btn.addEventListener("click", nextStep));
  prevBtns.forEach(btn => btn.addEventListener("click", prevStep));

  // Manejar el envío del formulario
  const apiUrl = "https://nodejs-production-bd02.up.railway.app/api/survey";

  document.getElementById("surveyForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Capturar los datos del formulario
    const surveyData = {
      nombre: document.querySelector('[name="nombre"]').value || "",
      nrohab: document.querySelector('[name="nrohab"]').value || "",
      check_in: document.querySelector('[name="check_in"]:checked')?.value || "",
      hab: document.querySelector('[name="hab"]:checked')?.value || "",
      bath: document.querySelector('[name="bath"]:checked')?.value || "",
      redp: document.querySelector('[name="redp"]:checked')?.value || "",
      manolo: document.querySelector('[name="manolo"]:checked')?.value || "",
      desay: document.querySelector('[name="desay"]:checked')?.value || "",
      rmserv: document.querySelector('[name="rmserv"]:checked')?.value || "",
      pool: document.querySelector('[name="pool"]:checked')?.value || "",
      check_out: document.querySelector('[name="check_out"]:checked')?.value || "",
      gneral: document.querySelector('[name="gneral"]:checked')?.value || "",
    };

    // Validar que todos los campos estén completos
    if (Object.values(surveyData).some(value => value === "")) {
      alert("Por favor, responde todas las preguntas antes de enviar.");
      return;
    }

    // Enviar los datos al backend
    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(surveyData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Error en la respuesta del servidor");
        }
        return response.json();
      })
      .then(data => {
        alert("Encuesta guardada exitosamente: " + data.message);
        window.location.href = "/gracias.html"; // Redirigir a una página de agradecimiento
      })
      .catch(error => {
        console.error("Error:", error);
        alert("Ocurrió un error al guardar la encuesta.");
      });
  });
});
