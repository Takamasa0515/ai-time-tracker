class CreateTasks < ActiveRecord::Migration[7.1]
  def change
    create_table :tasks do |t|
      t.references :category, null: false, foreign_key: true
      t.string :name
      t.datetime :start_time
      t.datetime :end_time
      t.integer :duration
      t.integer :pomodoro_sets

      t.timestamps
    end
  end
end
