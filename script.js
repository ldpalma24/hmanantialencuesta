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

            // Añadir la animación de caída
            current.classList.add('fall');
            
            // Esperar a que termine la animación de caída para mostrar la siguiente
            setTimeout(() => {
                current.classList.remove('active', 'fall');
                next.classList.add('active', 'appear');

                // Remover la clase de aparición tras la animación
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
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        alert("Gracias por completar la encuesta.");
        
    });
});
