const estadoCivil = document.getElementById('estadoCivil');
const conyugeSection = document.getElementById('conyugeSection');

estadoCivil.addEventListener('change', () => {

    if(estadoCivil.value === 'Casado(a)'){
        conyugeSection.style.display = 'block';
    }else{
        conyugeSection.style.display = 'none';
    }

});

document.getElementById('financiamientoForm')
.addEventListener('submit', function(e){

    e.preventDefault();

    const mensaje = `
*PRE-ANÁLISIS DE FINANCIAMIENTO*

👤 Nombre: ${nombre.value}
📄 CPF: ${cpf.value}
🎂 Fecha Nacimiento: ${fechaNacimiento.value}
📱 Teléfono: ${telefono.value}

💍 Estado Civil: ${estadoCivil.value}

👨‍💼 Profesión: ${profesion.value}
💰 Ingreso Bruto: ${salario.value}
🏢 Más de 3 años registrado: ${trabajo.value}

👨‍👩‍👧 Dependientes: ${dependientes.value}

🏠 Tipo Inmueble: ${tipoInmueble.value}
🏗️ Condición: ${condicion.value}
📍 Ciudad: ${ciudad.value}

👫 Cónyuge: ${nombreConyuge.value}
💰 Salario Cónyuge: ${salarioConyuge.value}
`;

    const telefonoWhatsapp = "5567996431786";

    const url =
    `https://wa.me/${telefonoWhatsapp}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, '_blank');

});