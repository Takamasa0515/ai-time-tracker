class DashboardController < ApplicationController
  def index
    @categories = Category.all
    @timer_setting = TimerSetting.current
    @today_tasks = Task.today.order(created_at: :desc)
    @today_total_duration = @today_tasks.sum(:duration) || 0
  end
end
