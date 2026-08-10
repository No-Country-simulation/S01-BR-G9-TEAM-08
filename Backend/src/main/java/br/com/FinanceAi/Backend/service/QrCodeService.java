package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.response.QrCodeResponseDTO;
import com.google.zxing.BinaryBitmap;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.Result;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.InputStream;

@Service
public class QrCodeService {

    public QrCodeResponseDTO lerCodigoDaImagem(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("O arquivo de imagem não pode estar vazio.");
        }

        try (InputStream inputStream = file.getInputStream()) {
            BufferedImage bufferedImage = ImageIO.read(inputStream);

            if (bufferedImage == null) {
                throw new IllegalArgumentException("O arquivo enviado não é uma imagem válida.");
            }

            BufferedImageLuminanceSource source = new BufferedImageLuminanceSource(bufferedImage);
            BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));

            Result result = new MultiFormatReader().decode(bitmap);

            return new QrCodeResponseDTO(
                    result.getText(),
                    result.getBarcodeFormat().toString()
            );

        } catch (Exception e) {
            throw new RuntimeException("Não foi possível identificar um QR Code ou Código de Barras válido na imagem.", e);
        }
    }
}