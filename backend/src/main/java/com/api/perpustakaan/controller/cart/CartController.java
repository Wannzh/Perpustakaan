package com.api.perpustakaan.controller.cart;

import com.api.perpustakaan.dto.cart.CartRequestDTO;
import com.api.perpustakaan.service.cart.CartService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody CartRequestDTO request, HttpServletRequest servletRequest) {
        UUID siswaId = (UUID) servletRequest.getAttribute("userId");
        return cartService.addToCart(siswaId, request);
    }

    @DeleteMapping("/remove/{bookId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Integer bookId, HttpServletRequest servletRequest) {
        UUID siswaId = (UUID) servletRequest.getAttribute("userId");
        return cartService.removeFromCart(siswaId, bookId);
    }

    @GetMapping
    public ResponseEntity<?> getCart(HttpServletRequest servletRequest) {
        UUID siswaId = (UUID) servletRequest.getAttribute("userId");
        return ResponseEntity.ok(cartService.getCart(siswaId));
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(HttpServletRequest servletRequest) {
        UUID siswaId = (UUID) servletRequest.getAttribute("userId");

        if (siswaId == null) {
            return ResponseEntity.status(401).body("Unauthorized: userId tidak ditemukan dalam token.");
        }

        return cartService.checkout(siswaId);
    }
}
