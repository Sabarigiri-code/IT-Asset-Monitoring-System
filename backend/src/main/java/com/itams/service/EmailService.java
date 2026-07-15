package com.itams.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    /**
     * Simulates sending an email by printing it to the console logs.
     * In a real production environment, we would inject JavaMailSender here.
     */
    public void sendAssetDeadlineNotification(String toEmail, String employeeName, String assetName, String assetId, long daysRemaining) {
        
        String subject = "Action Required: Asset Deadline Approaching (" + assetName + ")";
        
        String body = String.format("""
            =============================================================
            MOCK EMAIL SENT TO: %s
            SUBJECT: %s
            -------------------------------------------------------------
            Hello %s,
            
            This is an automated reminder that your assigned asset is 
            approaching its deadline/expiration date in %d days.
            
            Asset Details:
            - Name: %s
            - Asset ID: %s
            
            Please log into the IT Asset Monitoring System to review 
            or submit a return/renewal request if necessary.
            
            Regards,
            IT Department
            =============================================================
            """, toEmail, subject, employeeName, daysRemaining, assetName, assetId);

        logger.info("\n" + body);
    }
}
