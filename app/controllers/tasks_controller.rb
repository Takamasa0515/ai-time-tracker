class TasksController < ApplicationController
  before_action :set_task, only: [:update, :destroy]
  
  def index
    @tasks = Task.includes(:category).order(created_at: :desc)
    render json: @tasks.as_json(include: :category)
  end
  
  def today
    @tasks = Task.today.includes(:category).order(created_at: :desc)
    render json: @tasks.as_json(include: :category)
  end
  
  def create
    @task = Task.new(task_params)
    
    if @task.save
      render json: @task.as_json(include: :category), status: :created
    else
      render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def update
    if @task.update(task_params)
      render json: @task.as_json(include: :category)
    else
      render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def destroy
    @task.destroy
    head :no_content
  end
  
  def duplicate
    original_task = Task.find(params[:id])
    @task = original_task.dup
    @task.start_time = nil
    @task.end_time = nil
    @task.duration = nil
    
    if @task.save
      render json: @task.as_json(include: :category), status: :created
    else
      render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  private
  
  def set_task
    @task = Task.find(params[:id])
  end
  
  def task_params
    params.require(:task).permit(:name, :category_id, :start_time, :end_time, :duration, :pomodoro_sets)
  end
end
