package com.api.perpustakaan.service.laporan;

import com.api.perpustakaan.dto.laporan.BukuTerpopulerDTO;
import com.api.perpustakaan.dto.laporan.SiswaTerlambatDTO;
import com.itextpdf.text.*;
import com.itextpdf.text.Font;
import com.itextpdf.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LaporanExportServiceImpl implements LaporanExportService {
    @Override
    public ByteArrayInputStream exportBukuTerpopulerToPdf(List<BukuTerpopulerDTO> data) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font fontHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
            document.add(new Paragraph("Laporan Buku Terpopuler", fontHeader));

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setWidths(new int[] { 4, 2 });

            table.addCell("Judul Buku");
            table.addCell("Jumlah Dipinjam");

            for (BukuTerpopulerDTO item : data) {
                table.addCell(item.judulBuku());
                table.addCell(String.valueOf(item.totalDipinjam()));

            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Gagal membuat PDF", e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    @Override
    public ByteArrayInputStream exportSiswaTerlambatToExcel(List<SiswaTerlambatDTO> data) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Siswa Terlambat");

            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Nama Siswa");
            header.createCell(1).setCellValue("Jumlah Terlambat");

            int rowIdx = 1;
            for (SiswaTerlambatDTO siswa : data) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(siswa.namaSiswa());
                row.createCell(1).setCellValue(siswa.totalTerlambat());
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Gagal membuat Excel", e);
        }
    }
}
