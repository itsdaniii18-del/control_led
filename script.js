
// Guardamos los elementos de la página
const conectar = document.getElementById("btnConectar");
const encender = document.getElementById("btnEncender");
const apagar = document.getElementById("btnApagar");

const estado = document.getElementById("estadoConexion");
const respuesta = document.getElementById("mensaje");

// Variables para la conexión USB
let puerto;
let escritor;
let lector;

// Función para conectar con Arduino
conectar.addEventListener("click", async () => {
    if (!("serial" in navigator)) {
        respuesta.textContent = "Este navegador no es compatible. Usa Chrome o Edge en una conexión segura (HTTPS o localhost).";
        return;
    }

    try {
        // Solicitamos seleccionar el puerto USB
        puerto = await navigator.serial.requestPort();

        // Abrimos la comunicación a 9600 baudios
        await puerto.open({ baudRate: 9600 });

        // Preparamos la recepción de mensajes
        const decodificador = new TextDecoderStream();

        puerto.readable.pipeTo(decodificador.writable)
            .catch(error => console.log(error));

        lector = decodificador.readable.getReader();

        // Preparamos el envío de órdenes
        escritor = puerto.writable.getWriter();

        estado.textContent = "Arduino conectado correctamente";
        respuesta.textContent = "Esperando órdenes...";

        conectar.disabled = true;
        encender.disabled = false;
        apagar.disabled = false;

        // Leemos las respuestas de Arduino
        leerRespuestas();

    } catch (error) {
        estado.textContent = "Arduino desconectado";
        respuesta.textContent = "Error: " + error.message;
    }
});

// Función para recibir respuestas
async function leerRespuestas() {

    try {
        while (true) {

            const { value, done } = await lector.read();

            if (done) break;

            if (value) {
                respuesta.textContent = value.trim();
            }
        }
    } catch (error) {
        console.log("Error de lectura:", error);
    }
}

// Función para enviar órdenes
async function enviarOrden(orden) {

    try {
        await escritor.write(
            new TextEncoder().encode(orden + "\n")
        );

    } catch (error) {
        respuesta.textContent = "Error al enviar la orden";
    }
}

// Botón para encender el LED
encender.addEventListener("click", () => {
    enviarOrden("ON");
});

// Botón para apagar el LED
apagar.addEventListener("click", () => {
    enviarOrden("OFF");
});
