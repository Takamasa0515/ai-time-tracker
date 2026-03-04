class SettingsController < ApplicationController
  def index
    @timer_setting = TimerSetting.current
    @categories = Category.all.order(created_at: :asc)
  end
  
  def update
    @timer_setting = TimerSetting.current
    
    if @timer_setting.update(timer_setting_params)
      redirect_to settings_path, notice: '設定を更新しました'
    else
      @categories = Category.all.order(created_at: :asc)
      render :index, status: :unprocessable_entity
    end
  end
  
  private
  
  def timer_setting_params
    params.require(:timer_setting).permit(
      :work_duration,
      :break_duration,
      :long_break_duration,
      :sets,
      :notification_enabled,
      :sound_enabled,
      :auto_start_next
    )
  end
end
