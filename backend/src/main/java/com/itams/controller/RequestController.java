package com.itams.controller;

import com.itams.model.Request;
import com.itams.repository.RequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
public class RequestController {

    @Autowired
    private RequestRepository requestRepository;

    @GetMapping
    public List<Request> getAllRequests() {
        return requestRepository.findAll();
    }

    @GetMapping("/{id}")
    public Request getRequestById(@PathVariable String id) {
        return requestRepository.findById(id).orElseThrow(() -> new RuntimeException("Request not found"));
    }

    @PostMapping
    public Request createRequest(@RequestBody Request request) {
        return requestRepository.save(request);
    }

    @PutMapping("/{id}")
    public Request updateRequest(@PathVariable String id, @RequestBody Request requestDetails) {
        Request request = requestRepository.findById(id).orElseThrow(() -> new RuntimeException("Request not found"));
        
        request.setType(requestDetails.getType());
        request.setTitle(requestDetails.getTitle());
        request.setAssetId(requestDetails.getAssetId());
        request.setDate(requestDetails.getDate());
        request.setStatus(requestDetails.getStatus());
        request.setPriority(requestDetails.getPriority());
        request.setIcon(requestDetails.getIcon());
        request.setColor(requestDetails.getColor());
        request.setDesc(requestDetails.getDesc());
        request.setRequesterName(requestDetails.getRequesterName());
        request.setRequesterEmail(requestDetails.getRequesterEmail());
        request.setReturnReason(requestDetails.getReturnReason());
        request.setAttachmentData(requestDetails.getAttachmentData());
        request.setDamaged(requestDetails.isDamaged());
        request.setRepairProofData(requestDetails.getRepairProofData());
        request.setReturnDeadline(requestDetails.getReturnDeadline());
        request.setFineAmount(requestDetails.getFineAmount());
        
        return requestRepository.save(request);
    }

    @DeleteMapping("/{id}")
    public void deleteRequest(@PathVariable String id) {
        requestRepository.deleteById(id);
    }
}
