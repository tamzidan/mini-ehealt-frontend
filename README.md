# Frontend - Aplikasi Booking Dokter

Ini adalah antarmuka pengguna (UI) untuk aplikasi booking dokter. Dibangun menggunakan **React** dan **TypeScript**, aplikasi ini menyediakan pengalaman pengguna yang interaktif dan responsif untuk mencari, melihat jadwal, dan memesan konsultasi dokter.

[![React Version](https://img.shields.io/badge/React-18.2.0-blue.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel-black.svg?logo=vercel)](https://mini-ehealt-frontend.vercel.app/)

---

## 🔗 Live Demo

Aplikasi ini dapat diakses secara publik melalui link berikut:

**[Kunjungi Live Demo](https://mini-ehealt-frontend.vercel.app/)**

---

## 📸 Tampilan Aplikasi

* **Halaman Utama (Daftar Dokter)**
    ![Halaman Utama](https://i.postimg.cc/CLnkyKZw/Screenshot-2025-08-01-080705.png)

* **Modal Booking Jadwal**
    ![Modal Booking](https://i.postimg.cc/gJBXQ9mw/Screenshot-2025-08-01-080726.png)

---

## ✨ Fitur Utama

-   **Tampilan Daftar Dokter**: Menampilkan kartu dokter dengan informasi lengkap seperti nama, spesialisasi, lokasi, dan rating.
-   **Filter Dinamis**: Pengguna dapat dengan mudah memfilter dokter berdasarkan kategori spesialisasi.
-   **Modal Interaktif**: Proses melihat jadwal dan melakukan booking disajikan dalam *modal* tanpa perlu pindah halaman.
-   **Desain Responsif**: Tampilan yang dioptimalkan untuk berbagai ukuran layar, mulai dari desktop hingga mobile, menggunakan **Tailwind CSS**.
-   **State Management**: Mengelola state aplikasi secara efisien menggunakan React Hooks (`useState`, `useEffect`).
-   **Penanganan Asynchronous**: Mengambil data dari backend API dengan indikator *loading* dan penanganan *error* untuk pengalaman pengguna yang lebih baik.

---

## 🛠️ Tumpukan Teknologi (Tech Stack)

-   **Bahasa**: **TypeScript**
-   **Framework**: **React**
-   **Styling**: **Tailwind CSS**
-   **Deployment**: **Vercel**
-   **API Client**: `fetch` API atau `Axios`

---

## 🚀 Menjalankan Proyek Secara Lokal

Berikut adalah panduan untuk menjalankan proyek ini di lingkungan pengembangan lokal.

### Prasyarat

-   Node.js (v18 atau lebih baru)
-   `npm` atau `yarn`

### Langkah-langkah Instalasi

1.  **Clone Repositori**
    ```bash
    git clone [https://github.com/tamzidan/mini-ehealt-frontend.git](https://github.com/tamzidan/mini-ehealt-frontend.git)
    cd mini-ehealt-frontend
    ```

2.  **Install Dependensi**
    ```bash
    npm install
    ```
    atau jika menggunakan yarn:
    ```bash
    yarn install
    ```

3.  **Konfigurasi Environment Variables**
    -   Buat file baru bernama `.env` di direktori root proyek.
    -   Tambahkan variabel berikut ke dalam file `.env`. Ini akan menghubungkan frontend Anda ke backend yang berjalan di lokal.

    ```env
    # file: .env
    REACT_APP_API_URL=[http://127.0.0.1:5000/v1](http://127.0.0.1:5000/v1)
    ```

4.  **Jalankan Development Server**
    ```bash
    npm start
    ```
    atau jika menggunakan yarn:
    ```bash
    yarn start
    ```

5.  **Buka Aplikasi**
    -   Buka browser Anda dan kunjungi `http://localhost:3000`.

---

## ☁️ Deployment

Aplikasi ini di-deploy secara otomatis ke **Vercel**. Setiap *push* ke *branch* `main` akan memicu proses build dan deployment baru. *Environment variable* `REACT_APP_API_URL` untuk lingkungan produksi dikonfigurasi melalui dashboard Vercel untuk menunjuk ke alamat API backend yang sesuai.