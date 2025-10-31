# Encuadrado-Front

Prueba Software Engineer (2025) - Encuadrado

## 📋 Descripción

Este proyecto es el frontend de la aplicación Encuadrado, desarrollado como parte de la prueba técnica para la posición de Software Engineer 2025.

## 🚀 Tecnologías

- **TypeScript** (99.8%)
- Framework/Librería: React
- Tecnología Usada: Vite

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/NebeIung/Encuadrado-Front.git

# Navegar al directorio del proyecto
cd Encuadrado-Front

# Instalar dependencias
npm install
# o
yarn install
```

## 🏃‍♂️ Ejecución

```bash
# Modo desarrollo
npm run dev
# o
yarn dev

# Compilar para producción
npm run build
# o
yarn build
```

## 🏗️ Estructura del Proyecto

```
Encuadrado-Front/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   └── ...
├── public/
├── package.json
└── README.md
```

## ✨ Características

- Poder agendar Hora como paciente mediante la plataforma Pública desde el principio, desde la página de Especialidades o desde la página de Profesionales.
- Poder agendar, modificar, cancelar, confirmar o poner como ausente las horas médicas desde la plataforma privada.
- Roles definidos como:
  - administrador:
    - Puede ver el Dashboard, las Agendas y Gestión de Citas de todos los profesionales.
    - Agendar, modificar, cancelar, confirmar o poner como ausente las horas médicas de cada Profesional.
    - Agregar, modificar o eliminar Profesionales, así como modificar las especialidades de cada profesional con sus Términos y Condiciones y los horarios de cada especialidad del profesional.
    - Agregar, modificar o eliminar Pacientes.
    - Agregar, modificar, eliminar y visualizar los Servicios o Especialidades del centro, así como ver o modificar los Términos y Condiciones de cada Especialidad seleccionando el profesional.
    - Configurar o modificar información del Centro de Salud.
  - Miembro:
    - Puede ver el Dashboard, las Agendas y Gestión de Citas de sus Especialidades asignadas.
    - Agendar, modificar, cancelar, confirmar o poner como ausente las horas médicas de sus Especialidades asignadas.
    - visualizar los Servicios o Especialidades asignadas, así como ver o modificar los Términos y Condiciones de cada Especialidad.
  - Limitado:
    - Puede ver el Dashboard, las Agendas y Gestión de Citas de sus Especialidades asignadas.
    - Visualizar Especialidades, así como ver los Términos y Condiciones de cada Especialidad.

## 🔧 Configuración

Crear un archivo ```.env``` en la ruta ```Encuadrado-Front/``` con el siguiente código:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

## 👤 Autor

**NebeIung**

- GitHub: [@NebeIung](https://github.com/NebeIung)

## 🤝 Contribuciones

Este proyecto es parte de una prueba técnica.

---

⭐️ Desarrollado como parte de la prueba técnica para Encuadrado
