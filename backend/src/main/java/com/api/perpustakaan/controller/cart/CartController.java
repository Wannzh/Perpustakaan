package com.api.perpustakaan.controller.cart;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.perpustakaan.dto.cart.CartRequestDTO;
import com.api.perpustakaan.service.cart.CartService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestBody;

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
}
