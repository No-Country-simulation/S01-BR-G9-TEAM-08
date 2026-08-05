package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.dto.response.QrCodeResponseDTO;
import br.com.FinanceAi.Backend.service.QrCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/qrcode")
public class QrCodeController {

    private final QrCodeService qrCodeService;

    public QrCodeController(QrCodeService qrCodeService) {
        this.qrCodeService = qrCodeService;
    }

    @PostMapping("/ler")
    public ResponseEntity<QrCodeResponseDTO> lerQrCode(@RequestParam("imagem") MultipartFile file) {
        QrCodeResponseDTO response = qrCodeService.lerCodigoDaImagem(file);
        return ResponseEntity.ok(response);
    }
}