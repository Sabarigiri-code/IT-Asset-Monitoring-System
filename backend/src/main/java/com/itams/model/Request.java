package com.itams.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "requests")
public class Request {
    @Id
    private String id;
    private String type; // e.g., 'Request', 'Issue'
    private String title;
    private String assetId;
    private String date;
    private String status; // 'Pending Approval', 'Approved', 'Rejected'
    private String priority;
    private String icon;
    private String color;
    private String desc;
    private String requesterName;
    private String requesterEmail;
    
    private String returnReason;
    private String attachmentData;
    @com.fasterxml.jackson.annotation.JsonProperty("isDamaged")
    private boolean isDamaged;
    
    private String repairProofData;
    private String returnDeadline;
    private double fineAmount;

    public Request() {}

    public Request(String id, String type, String title, String assetId, String date, String status, String priority, String icon, String color, String desc, String requesterName, String requesterEmail) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.assetId = assetId;
        this.date = date;
        this.status = status;
        this.priority = priority;
        this.icon = icon;
        this.color = color;
        this.desc = desc;
        this.requesterName = requesterName;
        this.requesterEmail = requesterEmail;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAssetId() { return assetId; }
    public void setAssetId(String assetId) { this.assetId = assetId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getDesc() { return desc; }
    public void setDesc(String desc) { this.desc = desc; }

    public String getRequesterName() { return requesterName; }
    public void setRequesterName(String requesterName) { this.requesterName = requesterName; }

    public String getRequesterEmail() { return requesterEmail; }
    public void setRequesterEmail(String requesterEmail) { this.requesterEmail = requesterEmail; }

    public String getReturnReason() { return returnReason; }
    public void setReturnReason(String returnReason) { this.returnReason = returnReason; }

    public String getAttachmentData() { return attachmentData; }
    public void setAttachmentData(String attachmentData) { this.attachmentData = attachmentData; }

    public boolean isDamaged() { return isDamaged; }
    public void setDamaged(boolean damaged) { isDamaged = damaged; }

    public String getRepairProofData() { return repairProofData; }
    public void setRepairProofData(String repairProofData) { this.repairProofData = repairProofData; }

    public String getReturnDeadline() { return returnDeadline; }
    public void setReturnDeadline(String returnDeadline) { this.returnDeadline = returnDeadline; }

    public double getFineAmount() { return fineAmount; }
    public void setFineAmount(double fineAmount) { this.fineAmount = fineAmount; }
}
