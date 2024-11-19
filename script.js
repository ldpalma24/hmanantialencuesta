document.addEventListener("DOMContentLoaded", function() {
  // (código omitido para brevedad)

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
      const response = await fetch('https://hmanantialencuesta.vercel.app/submit-survey', { // Asegúrate de usar la URL correcta de tu nuevo servidor
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
