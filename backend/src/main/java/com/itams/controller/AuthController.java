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

    private static final String PRIMARY_ADMIN_EMAIL = "girimsabari7@gmail.com";

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (user.getEmail() != null && user.getEmail().trim().equalsIgnoreCase(PRIMARY_ADMIN_EMAIL)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Error: This email belongs to the primary Administrator. Admin accounts cannot be created via registration. Please sign in instead."));
        }

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Error: Email is already registered!"));
        }
        
        // Strict enforcement: all registrations are Employees only
        user.setRole("employee");
        user.setStatus("Active");
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
        
        // Strict role check: Only the designated primary admin can log in with role "admin"
        if (requestedRole != null && requestedRole.equalsIgnoreCase("admin")) {
            boolean isAdmin = "admin".equalsIgnoreCase(user.getRole()) || PRIMARY_ADMIN_EMAIL.equalsIgnoreCase(user.getEmail());
            if (!isAdmin) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access Denied: Only the designated Administrator can log in as Admin."));
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

        // The system only has ONE designated Admin. Additional admin roles cannot be granted.
        if (newRole.equalsIgnoreCase("admin") || newRole.equalsIgnoreCase("super admin")) {
            if (!PRIMARY_ADMIN_EMAIL.equalsIgnoreCase(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", "Error: The system can only have one Administrator (" + PRIMARY_ADMIN_EMAIL + "). Additional admin accounts cannot be created."
                ));
            }
        }

        // The primary administrator cannot be demoted
        if (PRIMARY_ADMIN_EMAIL.equalsIgnoreCase(user.getEmail()) && !newRole.equalsIgnoreCase("admin")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "message", "Error: The primary Administrator account cannot be demoted."
            ));
        }

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
