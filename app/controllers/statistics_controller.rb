class StatisticsController < ApplicationController
  def index
    @categories = Category.all
    @period = params[:period] || 'day'
    
    # 期間に応じたタスクを取得
    @tasks = case @period
    when 'day'
      Task.today
    when 'week'
      Task.this_week
    when 'month'
      Task.this_month
    else
      Task.all
    end
    
    @tasks = @tasks.includes(:category).order(created_at: :desc)
  end
  
  def data
    period = params[:period] || 'day'
    
    tasks = case period
    when 'day'
      Task.today
    when 'week'
      Task.this_week
    when 'month'
      Task.this_month
    else
      Task.all
    end
    
    # 作業ごとの時間集計
    task_data = tasks.group(:name).sum(:duration)
    
    # カテゴリ別の時間集計
    category_data = tasks.joins(:category)
                         .group('categories.name')
                         .sum(:duration)
    
    render json: {
      task_data: task_data,
      category_data: category_data,
      total_duration: tasks.sum(:duration)
    }
  end
end
