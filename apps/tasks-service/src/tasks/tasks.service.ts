import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from './task.entity';
import { Comment } from './comment.entity';
import { User } from '../users/user.entity';
import {
  CreateTaskDto,
  UpdateTaskDto,
  CreateCommentDto,
  FilterTasksDto,
  TaskResponseDto,
  CommentResponseDto,
  PaginatedResponseDto,
} from './dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Create a new task
   */
  async create(createTaskDto: CreateTaskDto, authorId: string): Promise<Task> {
    // Verify author exists
    const author = await this.usersRepository.findOne({ where: { id: authorId } });
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    // Verify assigned users exist
    let assignedUsers: User[] = [];
    if (createTaskDto.assignedUserIds && createTaskDto.assignedUserIds.length > 0) {
      assignedUsers = await this.usersRepository.findBy({
        id: In(createTaskDto.assignedUserIds),
      });

      if (assignedUsers.length !== createTaskDto.assignedUserIds.length) {
        throw new BadRequestException('One or more assigned users not found');
      }
    }

    // Create task
    const task = this.tasksRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      priority: createTaskDto.priority,
      status: createTaskDto.status,
      authorId,
      author,
      assignedUsers,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
    });

    return this.tasksRepository.save(task);
  }

  /**
   * Find all tasks with filters and pagination
   */
  async findAll(filters: FilterTasksDto): Promise<PaginatedResponseDto<TaskResponseDto>> {
    const { page = 1, size = 10, status, priority, assignedUserId, authorId } = filters;

    const queryBuilder = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.author', 'author')
      .leftJoinAndSelect('task.assignedUsers', 'assignedUsers');

    // Apply filters
    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }
    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority });
    }
    if (authorId) {
      queryBuilder.andWhere('task.authorId = :authorId', { authorId });
    }
    if (assignedUserId) {
      queryBuilder.andWhere('assignedUsers.id = :assignedUserId', { assignedUserId });
    }

    // Pagination
    const skip = (page - 1) * size;
    queryBuilder.skip(skip).take(size);

    // Order by creation date (newest first)
    queryBuilder.orderBy('task.createdAt', 'DESC');

    const [tasks, total] = await queryBuilder.getManyAndCount();

    return {
      data: tasks.map((task) => this.toTaskResponse(task)),
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  /**
   * Find one task by ID
   */
  async findOne(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['author', 'assignedUsers'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  /**
   * Update a task
   */
  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
  ): Promise<Task> {
    const task = await this.findOne(id);

    // Check if user is the author
    if (task.authorId !== userId) {
      throw new ForbiddenException('You can only update your own tasks');
    }

    // Update assigned users if provided
    if (updateTaskDto.assignedUserIds) {
      const assignedUsers = await this.usersRepository.findBy({
        id: In(updateTaskDto.assignedUserIds),
      });

      if (assignedUsers.length !== updateTaskDto.assignedUserIds.length) {
        throw new BadRequestException('One or more assigned users not found');
      }

      task.assignedUsers = assignedUsers;
    }

    // Update other fields
    if (updateTaskDto.title !== undefined) task.title = updateTaskDto.title;
    if (updateTaskDto.description !== undefined) task.description = updateTaskDto.description;
    if (updateTaskDto.status !== undefined) task.status = updateTaskDto.status;
    if (updateTaskDto.priority !== undefined) task.priority = updateTaskDto.priority;
    if (updateTaskDto.dueDate !== undefined) {
      task.dueDate = new Date(updateTaskDto.dueDate);
    }

    return this.tasksRepository.save(task);
  }

  /**
   * Delete a task
   */
  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id);

    // Check if user is the author
    if (task.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own tasks');
    }

    await this.tasksRepository.remove(task);
  }

  /**
   * Create a comment on a task
   */
  async createComment(
    taskId: string,
    createCommentDto: CreateCommentDto,
    authorId: string,
  ): Promise<Comment> {
    // Verify task exists
    const task = await this.findOne(taskId);

    // Verify author exists
    const author = await this.usersRepository.findOne({ where: { id: authorId } });
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    // Create comment
    const comment = this.commentsRepository.create({
      ...createCommentDto,
      taskId,
      task,
      authorId,
      author,
    });

    return this.commentsRepository.save(comment);
  }

  /**
   * Get all comments for a task with pagination
   */
  async getComments(
    taskId: string,
    page: number = 1,
    size: number = 10,
  ): Promise<PaginatedResponseDto<CommentResponseDto>> {
    // Verify task exists
    await this.findOne(taskId);

    const skip = (page - 1) * size;

    const [comments, total] = await this.commentsRepository.findAndCount({
      where: { taskId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip,
      take: size,
    });

    return {
      data: comments.map((comment) => this.toCommentResponse(comment)),
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  /**
   * Convert Task entity to TaskResponseDto
   */
  private toTaskResponse(task: Task): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      authorId: task.authorId,
      author: {
        id: task.author.id,
        username: task.author.username,
        email: task.author.email,
      },
      assignedUsers: task.assignedUsers.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
      })),
    };
  }

  /**
   * Convert Comment entity to CommentResponseDto
   */
  private toCommentResponse(comment: Comment): CommentResponseDto {
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      taskId: comment.taskId,
      authorId: comment.authorId,
      author: {
        id: comment.author.id,
        username: comment.author.username,
        email: comment.author.email,
      },
    };
  }
}
