package com.api.perpustakaan.service;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}") // pengirim
    private String from;

    @Override
    public void sendPeminjamanEmail(String to, String namaSiswa, String judulBuku,
            LocalDate tanggalJatuhTempo, Integer jumlahHariTerlambat,
            Integer totalDenda) {
        try {
            // 1. Buat context thymeleaf
            Context context = new Context();
            context.setVariable("namaSiswa", namaSiswa);
            context.setVariable("judulBuku", judulBuku);
            context.setVariable("tanggalJatuhTempo", tanggalJatuhTempo);
            context.setVariable("jumlahHariTerlambat", jumlahHariTerlambat == null ? 0 : jumlahHariTerlambat);
            context.setVariable("totalDenda", totalDenda == null ? 0 : totalDenda);

            // 2. Generate isi HTML dari template
            String htmlContent = templateEngine.process("email/notifikasi-peminjaman", context);

            // 3. Siapkan email
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress("hutasuhutsusi@gmail.com", "Perpustakaan SMAN 2 Plus Sipirok"));
            helper.setTo(to);
            helper.setSubject("Notifikasi Peminjaman Buku");
            helper.setText(htmlContent, true);

            // 4. Kirim
            mailSender.send(message);

        } catch (Exception e) {
            throw new RuntimeException("Gagal mengirim email: " + e.getMessage());
        }
    }
}
