class Category < ApplicationRecord
  has_many :tasks, dependent: :nullify
  
  validates :name, presence: true
  validates :color, format: { with: /\A#[0-9A-Fa-f]{6}\z/, message: "must be a valid hex color" }, allow_blank: true
  
  # デフォルトカラーを設定
  after_initialize :set_default_color, if: :new_record?
  
  private
  
  def set_default_color
    self.color ||= "##{SecureRandom.hex(3)}"
  end
end
