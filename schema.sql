CREATE TABLE posts(
    postID INTEGER NOT NULL AUTO_INCREMENT,
    posterID INTEGER NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER NOT NULL DEFAULT 0,
    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateEdited TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(postID),
    FOREIGN KEY(posterID) REFERENCES users (userID)
);

CREATE TABLE users(
    userID INTEGER NOT NULL AUTO_INCREMENT,
    userName VARCHAR(255) NOT NULL,
    userPassword VARCHAR(255) NOT NULL,
    PRIMARY KEY(userID)
);
