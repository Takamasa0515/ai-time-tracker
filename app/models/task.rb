class Task < ApplicationRecord
  belongs_to :category, optional: true
  
  validates :name, presence: true
  validates :duration, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  
  # スコープ
  scope :today, -> { where("DATE(start_time) = ?", Date.today) }
  scope :this_week, -> { where("start_time >= ?", Date.today.beginning_of_week) }
  scope :this_month, -> { where("start_time >= ?", Date.today.beginning_of_month) }
  scope :by_date, ->(date) { where("DATE(start_time) = ?", date) }
  
  # 作業時間を計算（秒単位）
  def calculate_duration
    return 0 unless start_time && end_time
    (end_time - start_time).to_i
  end
  
  # 作業時間を保存前に計算
  before_save :set_duration
  
  private
  
  def set_duration
    self.duration = calculate_duration if start_time && end_time
  end
end
