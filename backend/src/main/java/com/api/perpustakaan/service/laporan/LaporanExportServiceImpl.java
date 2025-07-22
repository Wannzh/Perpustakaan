package com.api.perpustakaan.service.laporan;

import com.api.perpustakaan.dto.laporan.BukuTerpopulerDTO;
import com.api.perpustakaan.dto.laporan.SiswaTerlambatDTO;
import com.itextpdf.text.*;
import com.itextpdf.text.Font;
import com.itextpdf.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LaporanExportServiceImpl implements LaporanExportService {

    private static final String LIBRARY_NAME = "SMA Negeri 2 Plus Sipirok Library";
    private static final String LIBRARY_TAGLINE = "Streamline library operations with ease.";
    private static final BaseColor PRIMARY_COLOR = new BaseColor(63, 81, 181); // Deep indigo
    private static final BaseColor ALTERNATE_ROW_COLOR = new BaseColor(245, 245, 245); // Light gray

    @Override
    public ByteArrayInputStream exportBukuTerpopulerToPdf(List<BukuTerpopulerDTO> data) {
        Document document = new Document(PageSize.A4, 36, 36, 90, 50); // Adjusted margins
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            // Header: Library Name and Tagline
            Font titleFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 20, PRIMARY_COLOR);
            Paragraph title = new Paragraph(LIBRARY_NAME, titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(5f);
            document.add(title);

            Font taglineFont = FontFactory.getFont(FontFactory.TIMES_ITALIC, 12, BaseColor.GRAY);
            Paragraph tagline = new Paragraph(LIBRARY_TAGLINE, taglineFont);
            tagline.setAlignment(Element.ALIGN_CENTER);
            tagline.setSpacingAfter(20f);
            document.add(tagline);

            // Report Title
            Font reportTitleFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 16, BaseColor.BLACK);
            Paragraph reportTitle = new Paragraph("Laporan Buku Terpopuler", reportTitleFont);
            reportTitle.setAlignment(Element.ALIGN_CENTER);
            reportTitle.setSpacingAfter(15f);
            document.add(reportTitle);

            // Timestamp
            Font timestampFont = FontFactory.getFont(FontFactory.TIMES_ITALIC, 10, BaseColor.GRAY);
            String timestamp = "Generated on: " + new SimpleDateFormat("dd MMMM yyyy, HH:mm").format(new Date());
            Paragraph timestampPara = new Paragraph(timestamp, timestampFont);
            timestampPara.setAlignment(Element.ALIGN_RIGHT);
            timestampPara.setSpacingAfter(10f);
            document.add(timestampPara);

            // Table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setWidths(new float[] { 4, 2 });
            table.setSpacingBefore(10f);
            table.setSpacingAfter(10f);

            // Table Header
            Font headerFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 12, BaseColor.WHITE);
            PdfPCell header1 = new PdfPCell(new Phrase("Judul Buku", headerFont));
            PdfPCell header2 = new PdfPCell(new Phrase("Jumlah Dipinjam", headerFont));
            header1.setBackgroundColor(PRIMARY_COLOR);
            header2.setBackgroundColor(PRIMARY_COLOR);
            header1.setHorizontalAlignment(Element.ALIGN_CENTER);
            header2.setHorizontalAlignment(Element.ALIGN_CENTER);
            header1.setPadding(10);
            header2.setPadding(10);
            header1.setBorderWidth(1f);
            header2.setBorderWidth(1f);
            table.addCell(header1);
            table.addCell(header2);

            // Table Body
            Font bodyFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 11, BaseColor.BLACK);
            boolean alternate = true;
            for (BukuTerpopulerDTO item : data) {
                PdfPCell cell1 = new PdfPCell(new Phrase(item.judulBuku(), bodyFont));
                PdfPCell cell2 = new PdfPCell(new Phrase(String.valueOf(item.totalDipinjam()), bodyFont));
                cell1.setPadding(8);
                cell2.setPadding(8);
                cell1.setBorderWidth(0.5f);
                cell2.setBorderWidth(0.5f);
                if (alternate) {
                    cell1.setBackgroundColor(ALTERNATE_ROW_COLOR);
                    cell2.setBackgroundColor(ALTERNATE_ROW_COLOR);
                }
                alternate = !alternate;
                table.addCell(cell1);
                table.addCell(cell2);
            }

            document.add(table);

            // Footer: Page Number
            writer.setPageEvent(new PdfPageEventHelper() {
                @Override
                public void onEndPage(PdfWriter writer, Document document) {
                    PdfContentByte cb = writer.getDirectContent();
                    Font footerFont = FontFactory.getFont(FontFactory.TIMES_ITALIC, 10, BaseColor.GRAY);
                    Phrase footer = new Phrase(
                        String.format("%s | Page %d", LIBRARY_NAME, writer.getPageNumber()),
                        footerFont
                    );
                    ColumnText.showTextAligned(
                        cb, Element.ALIGN_CENTER, footer,
                        (document.right() - document.left()) / 2 + document.leftMargin(),
                        document.bottom() - 20, 0
                    );
                }
            });

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to create PDF document: " + e.getMessage(), e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    @Override
    public ByteArrayInputStream exportSiswaTerlambatToExcel(List<SiswaTerlambatDTO> data) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Siswa Terlambat");

            // Styling for Title
            CellStyle titleStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font titleFont = workbook.createFont();
            titleFont.setFontName("Times New Roman");
            titleFont.setFontHeightInPoints((short) 16);
            titleFont.setBold(true);
            titleFont.setColor(IndexedColors.DARK_BLUE.getIndex());
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);

            // Styling for Subtitle
            CellStyle subtitleStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font subtitleFont = workbook.createFont();
            subtitleFont.setFontName("Times New Roman");
            subtitleFont.setFontHeightInPoints((short) 12);
            subtitleFont.setItalic(true);
            subtitleFont.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
            subtitleStyle.setFont(subtitleFont);
            subtitleStyle.setAlignment(HorizontalAlignment.CENTER);

            // Styling for Timestamp
            CellStyle timestampStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font timestampFont = workbook.createFont();
            timestampFont.setFontName("Times New Roman");
            timestampFont.setFontHeightInPoints((short) 10);
            timestampFont.setItalic(true);
            timestampFont.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
            timestampStyle.setFont(timestampFont);
            timestampStyle.setAlignment(HorizontalAlignment.RIGHT);

            // Styling for Header
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setFontName("Times New Roman");
            headerFont.setFontHeightInPoints((short) 12);
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            // Styling for Data
            CellStyle dataStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font dataFont = workbook.createFont();
            dataFont.setFontName("Times New Roman");
            dataFont.setFontHeightInPoints((short) 11);
            dataStyle.setFont(dataFont);
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);

            // Styling for Alternate Data Rows
            CellStyle alternateDataStyle = workbook.createCellStyle();
            alternateDataStyle.cloneStyleFrom(dataStyle);
            alternateDataStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            alternateDataStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Title Row
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue(LIBRARY_NAME);
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 1));

            // Tagline Row
            Row taglineRow = sheet.createRow(1);
            Cell taglineCell = taglineRow.createCell(0);
            taglineCell.setCellValue(LIBRARY_TAGLINE);
            taglineCell.setCellStyle(subtitleStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 1));

            // Timestamp Row
            Row timestampRow = sheet.createRow(2);
            Cell timestampCell = timestampRow.createCell(0);
            timestampCell.setCellValue("Generated on: " + new SimpleDateFormat("dd MMMM yyyy, HH:mm").format(new Date()));
            timestampCell.setCellStyle(timestampStyle);
            sheet.addMergedRegion(new CellRangeAddress(2, 2, 0, 1));

            // Empty Row for Spacing
            sheet.createRow(3);

            // Header Row
            Row headerRow = sheet.createRow(4);
            Cell headerCell1 = headerRow.createCell(0);
            headerCell1.setCellValue("Nama Siswa");
            headerCell1.setCellStyle(headerStyle);
            Cell headerCell2 = headerRow.createCell(1);
            headerCell2.setCellValue("Jumlah Terlambat");
            headerCell2.setCellStyle(headerStyle);

            // Data Rows
            int rowIdx = 5;
            boolean alternate = true;
            for (SiswaTerlambatDTO siswa : data) {
                Row row = sheet.createRow(rowIdx++);
                Cell cell1 = row.createCell(0);
                cell1.setCellValue(siswa.namaSiswa());
                Cell cell2 = row.createCell(1);
                cell2.setCellValue(siswa.totalTerlambat());
                CellStyle currentStyle = alternate ? alternateDataStyle : dataStyle;
                cell1.setCellStyle(currentStyle);
                cell2.setCellStyle(currentStyle);
                alternate = !alternate;
            }

            // Auto-size columns
            for (int i = 0; i < 2; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Excel document: " + e.getMessage(), e);
        }
    }
}