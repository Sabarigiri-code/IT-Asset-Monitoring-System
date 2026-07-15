package com.itams.scheduler;

import com.itams.model.Asset;
import com.itams.repository.AssetRepository;
import com.itams.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class DeadlineNotificationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(DeadlineNotificationScheduler.class);

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Runs every day at 8:00 AM server time.
     * Checks for assigned assets expiring in exactly 1 or 2 days.
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void checkAssetDeadlines() {
        logger.info("Running daily check for asset deadlines...");
        
        List<Asset> allAssets = assetRepository.findAll();
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (Asset asset : allAssets) {
            // Only care about assigned assets with a deadline
            if ("Assigned".equals(asset.getStatus()) && asset.getDeadlineDate() != null && !asset.getDeadlineDate().isEmpty()) {
                try {
                    LocalDate deadline = LocalDate.parse(asset.getDeadlineDate(), formatter);
                    long daysBetween = ChronoUnit.DAYS.between(today, deadline);
                    
                    if (daysBetween == 1 || daysBetween == 2) {
                        logger.info("Found asset {} assigned to {} expiring in {} days.", asset.getId(), asset.getAssignee(), daysBetween);
                        
                        // Mock lookup of email. In real app, fetch User by assignee name/id.
                        String mockEmail = asset.getAssignee().toLowerCase().replace(" ", ".") + "@company.com";
                        
                        emailService.sendAssetDeadlineNotification(mockEmail, asset.getAssignee(), asset.getName(), asset.getId(), daysBetween);
                    }
                } catch (Exception e) {
                    logger.error("Failed to parse deadline date for asset {}: {}", asset.getId(), e.getMessage());
                }
            }
        }
        logger.info("Completed daily asset deadline check.");
    }
}
