class CreateTimerSettings < ActiveRecord::Migration[7.1]
  def change
    create_table :timer_settings do |t|
      t.integer :work_duration, default: 25
      t.integer :break_duration, default: 5
      t.integer :long_break_duration, default: 15
      t.integer :sets, default: 4
      t.boolean :notification_enabled, default: true
      t.boolean :sound_enabled, default: true
      t.boolean :auto_start_next, default: false

      t.timestamps
    end
  end
end
