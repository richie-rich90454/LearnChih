package com.richardjiang880.lernchih.service;

import org.springframework.stereotype.Service;

@Service
public class PushService {

    public void sendPush(Long userId, String title, String body) {
        // TODO: implement with java-webpush library
        System.out.println("Push to user " + userId + ": " + title);
    }
}
