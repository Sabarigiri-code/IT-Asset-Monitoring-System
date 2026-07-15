package com.itams.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "assets")
public class Asset {

    @Id
    private String id;
    
    private String name;
    private String type; // Hardware, Software
    private String category; // Laptop, Monitor, License
    private String status; // Available, Assigned, In Repair
    private String assignee;
    private Integer health;
    private String dateAdded;
    private String deadlineDate;
    
    // Constructors
    public Asset() {}

    public Asset(String name, String type, String category, String status, String assignee, Integer health, String dateAdded, String deadlineDate) {
        this.name = name;
        this.type = type;
        this.category = category;
        this.status = status;
        this.assignee = assignee;
        this.health = health;
        this.dateAdded = dateAdded;
        this.deadlineDate = deadlineDate;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignee() { return assignee; }
    public void setAssignee(String assignee) { this.assignee = assignee; }

    public Integer getHealth() { return health; }
    public void setHealth(Integer health) { this.health = health; }

    public String getDateAdded() { return dateAdded; }
    public void setDateAdded(String dateAdded) { this.dateAdded = dateAdded; }

    public String getDeadlineDate() { return deadlineDate; }
    public void setDeadlineDate(String deadlineDate) { this.deadlineDate = deadlineDate; }
}
