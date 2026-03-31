package com.rag.gemini_rag.controller;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rag.gemini_rag.dto.JwtResponse;
import com.rag.gemini_rag.dto.LoginRequest;
import com.rag.gemini_rag.dto.MessageResponse;
import com.rag.gemini_rag.dto.SignupRequest;
import com.rag.gemini_rag.model.User;
import com.rag.gemini_rag.repository.UserRepository;
import com.rag.gemini_rag.security.jwt.JwtUtils;
import com.rag.gemini_rag.security.services.UserDetailsImpl;

@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = new User(userDetails.getName(), userDetails.getEmail(), null);
        user.setId(userDetails.getId());

        return ResponseEntity.ok(new JwtResponse(jwt, user));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account with Bcrypt password encoding
        User user = new User(signUpRequest.getName(), 
                             signUpRequest.getEmail(),
                             encoder.encode(signUpRequest.getPassword()));

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        // Since we are stateless, we clear the SecurityContext in this request lifecycle.
        // True token invalidation could be handled by blacklisting via Redis/DB in a real world scenario.
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(new MessageResponse("Log out successful!"));
    }
}
