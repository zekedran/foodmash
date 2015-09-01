class User < ActiveRecord::Base
  rolify
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  delegate :can?, :cannot?, to: :ability

  has_many :carts
  has_many :delivery_addresses, dependent: :destroy
  validates_presence_of :email, :mobile_no, :name, offers: {default: true}
  validates :name, length: {minimum: 2}
  validates :email, format: {with: /\A[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]+\z/}
  validates :mobile_no, presence: true, length: {is: 10}, numericality: {only_integer: true}, uniqueness: true
  before_create :generate_user_token
  
  def ability
    @ability ||= Ability.new(self)
  end

  def reset_password_token
    self.generate_reset_password_token
    self.save
  end

  private

  def generate_reset_password_token
    begin 
      self.reset_password_token = SecureRandom.hex(64)
    end while self.class.exists?(reset_password_token: self.reset_password_token)
  end

  def generate_user_token
    begin
      self.user_token = SecureRandom.hex(64)
    end while self.class.exists?(user_token: self.user_token)
  end

end
