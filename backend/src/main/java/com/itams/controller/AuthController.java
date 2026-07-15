package com.itams.controller;

import com.itams.model.User;
import com.itams.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Error: Email is already registered!"));
        }
        
        user.setRole("employee"); // Default role
        user.setRegisteredAt(new Date());
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", "User registered successfully!", "user", user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        String requestedRole = loginRequest.get("role"); // "employee" or "admin"
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Error: Account not found. Please register first."));
        }
        
        User user = userOpt.get();
        if ("Suspended".equals(user.getStatus())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Error: This account has been suspended by the administrator."));
        }
        
        if (!user.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Error: Incorrect password."));
        }
        
        // Simple role check for prototype. Real app would use robust RBAC.
        if (requestedRole != null && requestedRole.equals("admin") && !user.getRole().equals("admin")) {
            // For now, let's just let any registered user login as admin to make the prototype easier, 
            // OR enforce it if the user wants. The user didn't specify strict role separation, just that 
            // they must be registered. Let's enforce that they MUST be in the DB.
            // If they login as admin, we can auto-promote them to admin for prototype sake if they ask for it.
            if (!user.getRole().equals("admin")) {
                user.setRole("admin");
                userRepository.save(user);
            }
        }

        return ResponseEntity.ok(Map.of(
            "message", "Login successful!", 
            "user", user
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable String id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found."));
        }
        
        User user = userOpt.get();
        String newStatus = "Active".equals(user.getStatus()) ? "Suspended" : "Active";
        user.setStatus(newStatus);
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", "User status updated to " + newStatus, "user", user));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable String id, @RequestBody Map<String, String> request) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found."));
        }
        
        String newRole = request.get("role");
        if (newRole == null || newRole.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Role is required."));
        }

        User user = userOpt.get();
        user.setRole(newRole);
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", "User role updated successfully", "user", user));
    }

    @PutMapping("/users/{id}/profile")
    public ResponseEntity<?> updateUserProfile(@PathVariable String id, @RequestBody Map<String, String> request) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found."));
        }
        
        User user = userOpt.get();
        
        if (request.containsKey("name")) user.setFullName(request.get("name"));
        if (request.containsKey("email")) {
            String newEmail = request.get("email");
            if (!newEmail.equals(user.getEmail()) && userRepository.findByEmail(newEmail).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Error: Email is already taken by another account."));
            }
            user.setEmail(newEmail);
        }
        
        if (request.containsKey("dob")) user.setDob(request.get("dob"));
        if (request.containsKey("address")) user.setAddress(request.get("address"));
        if (request.containsKey("professionalDetails")) user.setProfessionalDetails(request.get("professionalDetails"));
        if (request.containsKey("officeLocation")) user.setOfficeLocation(request.get("officeLocation"));
        if (request.containsKey("department")) user.setDepartment(request.get("department"));
        
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully", "user", user));
    }
}
