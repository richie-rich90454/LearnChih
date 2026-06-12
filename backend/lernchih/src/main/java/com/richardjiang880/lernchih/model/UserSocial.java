package com.richardjiang880.lernchih.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_socials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSocial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String platform;

    @Column(nullable = false)
    private String url;
}
