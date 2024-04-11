#include <iostream>
#include <time.h>
#include <string>
#include <algorithm>
#include <vector> 
using namespace std;

string jumbleWord(string word) {
    random_shuffle(word.begin(), word.end());
    return word;
}

int main() {
    srand(time(0));

   string words[] = {
    "apple", "banana", "orange", "grape", "watermelon", 
    "mango", "strawberry", "pineapple", "kiwi", "coconut",
    "cherry", "apricot", "peach", "lemon", "lime",
    "blueberry", "raspberry", "blackberry",  "tomato",
    "potato", "carrot", "corn", "broccoli", "cucumber", 
    "pepper", "onion", "garlic", "mushroom",
    "spinach", "cabbage", "celery", "ginger", "pumpkin", 
     "papaya", "guava", "plum", "pear", 
  "ice", "grapefruit", "spinach", "drink", 
    "reddish", "eggplant", "burger", "pizza", "salad"
}; 
    int numWords = sizeof(words) / sizeof(words[0]);

    int score = 0;
    int lives = 3;
vector<bool> usedWords(numWords, false);
    while (lives > 0) {
      int randomIndex;
        do {
            randomIndex = rand() % numWords;
        } while (usedWords[randomIndex]); 
        string word = words[randomIndex];
        usedWords[randomIndex] = true; 
        string jumbledWord = jumbleWord(word);

        cout << "Jumbled word: " << jumbledWord << endl;
        cout << "Guess the word: ";

        string guess;
        cin >> guess;

        if (guess == word) {
            cout << "Correct!" << endl;
            score++;
        } else {
            cout << "Incorrect." << endl;
            lives--;
            cout << "Lives remaining: " << lives << endl;
        }

        cout << "Your current score is: " << score << endl;

        if (lives > 0) { 
            cout << "Play again? (y/n): ";
            char playAgain;
            cin >> playAgain;
            if (playAgain != 'y') {
                break;
            }
        }
    }

    if (lives == 0) {
        cout << "Game Over! You ran out of lives." << endl;
    } 
    cout << "Your final score is: " << score << endl;

    return 0;
}