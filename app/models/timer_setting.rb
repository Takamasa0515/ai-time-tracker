class TimerSetting < ApplicationRecord
  validates :work_duration, :break_duration, :long_break_duration, :sets,
            numericality: { greater_than: 0 }
  
  # シングルトンパターン（設定は1つのみ）
  def self.current
    first_or_create(
      work_duration: 25,
      break_duration: 5,
      long_break_duration: 15,
      sets: 4,
      notification_enabled: true,
      sound_enabled: true,
      auto_start_next: false
    )
  end
end
