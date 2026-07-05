package com.richardjiang880.lernchih.seeder;

import com.richardjiang880.lernchih.model.*;
import com.richardjiang880.lernchih.model.enums.ContentFormat;
import com.richardjiang880.lernchih.repository.*;
import com.richardjiang880.lernchih.util.SlugUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(value = "app.seed.enabled", havingValue = "true")
public class DemoDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;
    private final CourseRepository courseRepository;
    private final ResourceRepository resourceRepository;
    private final ResourceThreadRepository resourceThreadRepository;
    private final ResourcePostRepository resourcePostRepository;
    private final ChannelRepository channelRepository;
    private final ChannelThreadRepository channelThreadRepository;
    private final ChannelPostRepository channelPostRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataSeeder(UserRepository userRepository,
                          SubjectRepository subjectRepository,
                          TopicRepository topicRepository,
                          CourseRepository courseRepository,
                          ResourceRepository resourceRepository,
                          ResourceThreadRepository resourceThreadRepository,
                          ResourcePostRepository resourcePostRepository,
                          ChannelRepository channelRepository,
                          ChannelThreadRepository channelThreadRepository,
                          ChannelPostRepository channelPostRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.topicRepository = topicRepository;
        this.courseRepository = courseRepository;
        this.resourceRepository = resourceRepository;
        this.resourceThreadRepository = resourceThreadRepository;
        this.resourcePostRepository = resourcePostRepository;
        this.channelRepository = channelRepository;
        this.channelThreadRepository = channelThreadRepository;
        this.channelPostRepository = channelPostRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Demo data seeding skipped - users table already has rows.");
            return;
        }

        log.info("Seeding demo data into local H2 database...");

        User admin = userRepository.save(User.builder()
                .email("admin@example.com")
                .password(passwordEncoder.encode("password"))
                .name("Admin User")
                .role(Role.ADMIN)
                .verified(true)
                .credits(0)
                .build());

        User student = userRepository.save(User.builder()
                .email("student@example.com")
                .password(passwordEncoder.encode("password"))
                .name("Demo Student")
                .role(Role.STUDENT)
                .verified(true)
                .credits(0)
                .build());

        Subject cs = subjectRepository.save(Subject.builder().name("Computer Science").build());
        Subject math = subjectRepository.save(Subject.builder().name("Mathematics").build());

        Topic csTopic = topicRepository.save(Topic.builder().name("Algorithms").subject(cs).build());
        Topic mathTopic = topicRepository.save(Topic.builder().name("Calculus").subject(math).build());

        Course csCourse = courseRepository.save(Course.builder().name("Intro to CS").subject(cs).build());
        Course mathCourse = courseRepository.save(Course.builder().name("Calculus I").subject(math).build());

        Resource csResource = Resource.builder()
                .slug(SlugUtil.slugify("CS Article"))
                .title("CS Article")
                .description("A helpful article about computer science.")
                .category(ResourceCategory.ARTICLE)
                .type(ResourceType.LINK)
                .externalUrl("https://example.com/cs-article")
                .user(student)
                .subject(cs)
                .topic(csTopic)
                .course(csCourse)
                .upvoteCount(0)
                .build();
        csResource = resourceRepository.save(csResource);

        ResourceThread csThread = ResourceThread.builder()
                .resource(csResource)
                .content("Discussion thread for the CS article.")
                .format(ContentFormat.PLAIN)
                .build();
        csResource.setThread(csThread);
        csThread = resourceThreadRepository.save(csThread);

        ResourcePost csPost = ResourcePost.builder()
                .thread(csThread)
                .user(student)
                .content("Great article, very helpful for understanding algorithms.")
                .format(ContentFormat.PLAIN)
                .build();
        resourcePostRepository.save(csPost);

        Resource mathResource = Resource.builder()
                .slug(SlugUtil.slugify("Math Guide"))
                .title("Math Guide")
                .description("A beginner-friendly mathematics guide.")
                .category(ResourceCategory.GUIDE)
                .type(ResourceType.LINK)
                .externalUrl("https://example.com/math-guide")
                .user(student)
                .subject(math)
                .topic(mathTopic)
                .course(mathCourse)
                .upvoteCount(0)
                .build();
        mathResource = resourceRepository.save(mathResource);

        ResourceThread mathThread = ResourceThread.builder()
                .resource(mathResource)
                .content("Discussion thread for the math guide.")
                .format(ContentFormat.PLAIN)
                .build();
        mathResource.setThread(mathThread);
        mathThread = resourceThreadRepository.save(mathThread);

        ResourcePost mathPost = ResourcePost.builder()
                .thread(mathThread)
                .user(admin)
                .content("Thanks for sharing this calculus guide.")
                .format(ContentFormat.PLAIN)
                .build();
        resourcePostRepository.save(mathPost);

        Channel general = channelRepository.save(Channel.builder().name("General Discussion").description("General chat for everyone.").build());
        Channel studyHelp = channelRepository.save(Channel.builder().name("Study Help").description("Ask and answer study questions.").build());

        ChannelThread generalThread = ChannelThread.builder()
                .channel(general)
                .title("Welcome to LernChih")
                .content("Introduce yourself and say hello!")
                .format(ContentFormat.PLAIN)
                .user(student)
                .build();
        generalThread = channelThreadRepository.save(generalThread);

        ChannelPost postByStudent = ChannelPost.builder()
                .thread(generalThread)
                .user(student)
                .content("Hi everyone! Excited to learn together.")
                .format(ContentFormat.PLAIN)
                .build();
        channelPostRepository.save(postByStudent);

        ChannelPost postByAdmin = ChannelPost.builder()
                .thread(generalThread)
                .user(admin)
                .content("Welcome! Feel free to ask questions.")
                .format(ContentFormat.PLAIN)
                .build();
        channelPostRepository.save(postByAdmin);

        log.info("Demo data seeding complete. Created {} users, {} subjects, {} topics, {} courses, {} resources, {} resource posts, {} channels, and {} channel thread(s).",
                userRepository.count(), subjectRepository.count(), topicRepository.count(), courseRepository.count(),
                resourceRepository.count(), resourcePostRepository.count(), channelRepository.count(), channelThreadRepository.count());
    }
}
