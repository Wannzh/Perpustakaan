// package com.api.perpustakaan.controller;

// import java.time.LocalDate;

// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// import com.api.perpustakaan.service.EmailService;

// import lombok.RequiredArgsConstructor;

// @RestController
// @RequestMapping("/api/test")
// @RequiredArgsConstructor
// public class TestController {

//     private final EmailService emailService;

//     @PostMapping("/email")
//     public ResponseEntity<String> testEmail() {
//         emailService.sendPeminjamanEmail(
//                 "alwanfdhlrhmn@gmail.com", // Ganti dengan email aktif saat testing
//                 "Alwan",
//                 "Pemrograman Java Dasar",
//                 LocalDate.now().plusDays(1),
//                 0,
//                 0);

//         return ResponseEntity.ok("Email berhasil dikirim!");
//     }
// }
