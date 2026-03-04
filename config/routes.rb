Rails.application.routes.draw do
  # ルートパスをダッシュボードに設定
  root 'dashboard#index'
  
  # ダッシュボード
  get 'dashboard', to: 'dashboard#index'
  
  # タスク（作業履歴）のAPI
  resources :tasks, only: [:index, :create, :update, :destroy] do
    collection do
      get 'today'
      post 'duplicate/:id', to: 'tasks#duplicate', as: 'duplicate'
    end
  end
  
  # 統計情報
  get 'statistics', to: 'statistics#index'
  get 'statistics/data', to: 'statistics#data'
  
  # カテゴリ管理
  resources :categories, only: [:index, :create, :update, :destroy]
  
  # 設定
  get 'settings', to: 'settings#index'
  patch 'settings', to: 'settings#update'
  
  # ヘルスチェック
  get "up" => "rails/health#show", as: :rails_health_check
end
