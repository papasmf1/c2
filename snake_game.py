import pygame
import random
import sys
from pygame.locals import *

# 초기화
pygame.init()

# 색상 정의
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
GRAY = (128, 128, 128)

# 게임 설정
WINDOW_WIDTH = 800
WINDOW_HEIGHT = 600
GRID_SIZE = 20
GRID_WIDTH = WINDOW_WIDTH // GRID_SIZE
GRID_HEIGHT = WINDOW_HEIGHT // GRID_SIZE
SNAKE_SPEED = 10

# 화면 설정
screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
pygame.display.set_caption('뱀 게임')
clock = pygame.time.Clock()

class Snake:
    def __init__(self):
        self.length = 1
        self.positions = [(GRID_WIDTH // 2, GRID_HEIGHT // 2)]
        self.direction = random.choice([UP, DOWN, LEFT, RIGHT])
        self.color = GREEN
        self.score = 0
        
    def get_head_position(self):
        return self.positions[0]
    
    def update(self):
        cur = self.get_head_position()
        x, y = self.direction
        new = ((cur[0] + x) % GRID_WIDTH, (cur[1] + y) % GRID_HEIGHT)
        
        if new in self.positions[3:]:
            return False
        
        self.positions.insert(0, new)
        if len(self.positions) > self.length:
            self.positions.pop()
        return True
    
    def reset(self):
        self.length = 1
        self.positions = [(GRID_WIDTH // 2, GRID_HEIGHT // 2)]
        self.direction = random.choice([UP, DOWN, LEFT, RIGHT])
        self.score = 0
    
    def render(self, surface):
        for i, p in enumerate(self.positions):
            color = GREEN if i == 0 else (0, 200, 0)
            rect = pygame.Rect((p[0] * GRID_SIZE, p[1] * GRID_SIZE),
                             (GRID_SIZE, GRID_SIZE))
            pygame.draw.rect(surface, color, rect)
            pygame.draw.rect(surface, BLACK, rect, 1)

class Food:
    def __init__(self):
        self.position = (0, 0)
        self.color = RED
        self.randomize_position()
    
    def randomize_position(self):
        self.position = (random.randint(0, GRID_WIDTH-1),
                        random.randint(0, GRID_HEIGHT-1))
    
    def render(self, surface):
        rect = pygame.Rect((self.position[0] * GRID_SIZE,
                           self.position[1] * GRID_SIZE),
                          (GRID_SIZE, GRID_SIZE))
        pygame.draw.rect(surface, self.color, rect)
        pygame.draw.rect(surface, BLACK, rect, 1)

# 방향 상수
UP = (0, -1)
DOWN = (0, 1)
LEFT = (-1, 0)
RIGHT = (1, 0)

def draw_grid(surface):
    for y in range(0, WINDOW_HEIGHT, GRID_SIZE):
        for x in range(0, WINDOW_WIDTH, GRID_SIZE):
            rect = pygame.Rect((x, y), (GRID_SIZE, GRID_SIZE))
            pygame.draw.rect(surface, GRAY, rect, 1)

def show_score(surface, score):
    font = pygame.font.Font(None, 36)
    text = font.render(f'점수: {score}', True, WHITE)
    surface.blit(text, (10, 10))

def show_game_over(surface):
    font = pygame.font.Font(None, 72)
    text = font.render('게임 오버!', True, RED)
    text_rect = text.get_rect(center=(WINDOW_WIDTH//2, WINDOW_HEIGHT//2 - 50))
    surface.blit(text, text_rect)
    
    font_small = pygame.font.Font(None, 36)
    restart_text = font_small.render('R키를 눌러 재시작', True, WHITE)
    restart_rect = restart_text.get_rect(center=(WINDOW_WIDTH//2, WINDOW_HEIGHT//2 + 50))
    surface.blit(restart_text, restart_rect)

def main():
    snake = Snake()
    food = Food()
    game_over = False
    
    while True:
        for event in pygame.event.get():
            if event.type == QUIT:
                pygame.quit()
                sys.exit()
            elif event.type == KEYDOWN:
                if game_over:
                    if event.key == K_r:
                        snake.reset()
                        food.randomize_position()
                        game_over = False
                else:
                    if event.key == K_UP and snake.direction != DOWN:
                        snake.direction = UP
                    elif event.key == K_DOWN and snake.direction != UP:
                        snake.direction = DOWN
                    elif event.key == K_LEFT and snake.direction != RIGHT:
                        snake.direction = LEFT
                    elif event.key == K_RIGHT and snake.direction != LEFT:
                        snake.direction = RIGHT
        
        if not game_over:
            # 뱀 업데이트
            if not snake.update():
                game_over = True
            
            # 음식 먹기 확인
            if snake.get_head_position() == food.position:
                snake.length += 1
                snake.score += 10
                food.randomize_position()
                
                # 뱀이 음식 위치에 생성되지 않도록
                while food.position in snake.positions:
                    food.randomize_position()
        
        # 화면 그리기
        screen.fill(BLACK)
        draw_grid(screen)
        snake.render(screen)
        food.render(screen)
        show_score(screen, snake.score)
        
        if game_over:
            show_game_over(screen)
        
        pygame.display.update()
        clock.tick(SNAKE_SPEED)

if __name__ == '__main__':
    main()
