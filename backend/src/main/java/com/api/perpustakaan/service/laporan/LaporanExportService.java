package com.api.perpustakaan.service.laporan;

import com.api.perpustakaan.dto.laporan.BukuTerpopulerDTO;
import com.api.perpustakaan.dto.laporan.SiswaTerlambatDTO;

import java.io.ByteArrayInputStream;
import java.util.List;

public interface LaporanExportService {

    ByteArrayInputStream exportBukuTerpopulerToPdf(List<BukuTerpopulerDTO> data);
    ByteArrayInputStream exportSiswaTerlambatToExcel(List<SiswaTerlambatDTO> data);

}
