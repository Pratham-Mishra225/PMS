package org.example.pms.config;
import org.example.pms.entity.Medicine;
import org.example.pms.entity.User;
import org.example.pms.repository.MedicineRepository;
import org.example.pms.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;
@Component
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final MedicineRepository medicineRepository;
    private final PasswordEncoder passwordEncoder;
    public DataSeeder(UserRepository userRepository, MedicineRepository medicineRepository, 
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.medicineRepository = medicineRepository;
        this.passwordEncoder = passwordEncoder;
    }
    @Override
    public void run(String... args) {
        seedUsers();
        seedMedicines();
    }
    private void seedUsers() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Admin user created: admin/admin123");
        } else {
            // Fix password if it was stored as plain text
            userRepository.findByUsername("admin").ifPresent(user -> {
                if (!user.getPassword().startsWith("$2a$") && !user.getPassword().startsWith("$2b$")) {
                    user.setPassword(passwordEncoder.encode("admin123"));
                    userRepository.save(user);
                    System.out.println("Admin password re-encoded with BCrypt");
                }
            });
        }
        if (!userRepository.existsByUsername("test")) {
            User pharmacist = new User();
            pharmacist.setUsername("test");
            pharmacist.setPassword(passwordEncoder.encode("test123"));
            pharmacist.setRole(User.Role.PHARMACIST);
            userRepository.save(pharmacist);
            System.out.println("Pharmacist user created: test/test123");
        } else {
            // Fix password if it was stored as plain text
            userRepository.findByUsername("test").ifPresent(user -> {
                if (!user.getPassword().startsWith("$2a$") && !user.getPassword().startsWith("$2b$")) {
                    user.setPassword(passwordEncoder.encode("test123"));
                    userRepository.save(user);
                    System.out.println("Pharmacist password re-encoded with BCrypt");
                }
            });
        }
    }
    private void seedMedicines() {
        if (medicineRepository.count() == 0) {
            medicineRepository.save(new Medicine(null, "Paracetamol", "Crocin", "BATCH001", 
                    100, new BigDecimal("25.00"), LocalDate.now().plusMonths(12)));
            medicineRepository.save(new Medicine(null, "Ibuprofen", "Brufen", "BATCH002", 
                    50, new BigDecimal("45.00"), LocalDate.now().plusMonths(8)));
            medicineRepository.save(new Medicine(null, "Amoxicillin", "Moxikind", "BATCH003", 
                    30, new BigDecimal("120.00"), LocalDate.now().plusMonths(6)));
            medicineRepository.save(new Medicine(null, "Cetirizine", "Zyrtec", "BATCH004", 
                    80, new BigDecimal("35.00"), LocalDate.now().plusMonths(18)));
            medicineRepository.save(new Medicine(null, "Omeprazole", "Prilosec", "BATCH005", 
                    5, new BigDecimal("85.00"), LocalDate.now().plusDays(15)));
            System.out.println("Demo medicines seeded");
        }
    }
}
