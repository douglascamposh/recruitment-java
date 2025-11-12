package com.rag.gemini_rag.service.impl;

import com.rag.gemini_rag.service.IDocumentReaderService;
import com.rag.gemini_rag.utils.Utils;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.pdf.ParagraphPdfDocumentReader;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.stream.Collectors;

@Service
public class DocumentReaderServiceImpl implements IDocumentReaderService {

    @Override
    public String extractTextFromFile(MultipartFile file) throws IOException {
        String contentType = file.getContentType();

        if (contentType == null) {
            throw new IllegalArgumentException("No se pudo determinar el tipo de archivo: " + file.getOriginalFilename());
        }

        contentType = contentType.toLowerCase(); // Normalizamos

        String rawText;

        switch (contentType) {
            case "application/pdf":
                rawText = extractTextFromPdf(file);
                break;

//            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
//            case "application/msword":
//                rawText = extractTextFromDocx(file);
//                break;
//
//            case "text/plain":
//                rawText = new String(file.getBytes(), StandardCharsets.UTF_8);
//                break;
//
//            case "image/png":
//            case "image/jpeg":
//            case "image/tiff":
//                rawText = extractTextFromImage(file);
//                break;

            default:
                // fallback: intentamos con Tika, que soporta muchos formatos
//                rawText = extractTextWithTika(file);
//                break;
                throw new IllegalArgumentException("Tipo de archivo no soportado: " + contentType);
        }

        return Utils.cleanText(rawText);
    }

    private String extractTextFromPdf(MultipartFile file) throws IOException {
        var resource = new ByteArrayResource(file.getBytes(), file.getOriginalFilename());
        var reader = new PagePdfDocumentReader(resource);
        return reader.get().stream()
                .map(doc -> doc.getText())
                .collect(Collectors.joining("\n"));
    }

//    private String extractTextFromDocx(MultipartFile file) throws IOException {
//        try (var doc = new XWPFDocument(file.getInputStream());
//             var extractor = new XWPFWordExtractor(doc)) {
//            return extractor.getText();
//        }
//    }
//
//    private String extractTextFromImage(MultipartFile file) throws IOException {
//        // NOTA: Tesseract debe estar instalado en el sistema y, opcionalmente,
//        // la variable de entorno TESSDATA_PREFIX debe apuntar a la carpeta de datos de entrenamiento.
//        Tesseract tesseract = new Tesseract();
//        // tesseract.setDatapath("/usr/share/tesseract-ocr/4.00/tessdata"); // Ejemplo en Linux
//        // tesseract.setLanguage("spa+eng"); // Para español e inglés
//
//        try {
//            BufferedImage image = ImageIO.read(file.getInputStream());
//            if (image == null) {
//                throw new IOException("No se pudo leer la imagen.");
//            }
//            return tesseract.doOCR(image);
//        } catch (TesseractException e) {
//            throw new RuntimeException("Error durante el proceso de OCR", e);
//        }
//    }
}
