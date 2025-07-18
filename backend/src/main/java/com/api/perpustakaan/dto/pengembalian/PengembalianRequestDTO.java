package com.api.perpustakaan.dto.pengembalian;

import com.api.perpustakaan.constant.ReturnStatusConstant;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PengembalianRequestDTO {
    @NotNull(message = "ID peminjaman tidak boleh kosong")
    private Integer transactionId;
    @NotNull(message = "Status pengembalian tidak boleh kosong")
    private ReturnStatusConstant statusPengembalian;
    private String catatan;
}
