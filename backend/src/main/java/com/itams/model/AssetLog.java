package com.itams.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "asset_logs")
public class AssetLog {

    @Id
    private String id;

    private String assetId;
    private String assetName;
    private String action;      // e.g. "Returned", "Assigned"
    private String user;        // employee name
    private String userEmail;
    private String performedBy; // admin who approved
    private Date timestamp;

    public AssetLog() {}

    public AssetLog(String assetId, String assetName, String action, String user, String userEmail, String performedBy) {
        this.assetId = assetId;
        this.assetName = assetName;
        this.action = action;
        this.user = user;
        this.userEmail = userEmail;
        this.performedBy = performedBy;
        this.timestamp = new Date();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAssetId() { return assetId; }
    public void setAssetId(String assetId) { this.assetId = assetId; }

    public String getAssetName() { return assetName; }
    public void setAssetName(String assetName) { this.assetName = assetName; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }

    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }
}
