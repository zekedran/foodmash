class User < ActiveRecord::Base
  rolify
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  delegate :can?, :cannot?, to: :ability

  before_save :ensure_authentication_token
  before_save :ensure_mobile_authentication_token

  has_many :carts
  has_many :delivery_addresses, dependent: :destroy
  validates_presence_of :email, :mobile_no, :name
  validates :name, length: {minimum: 2}
  validates :email, format: {with: /\A[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]+\z/}
  validates :mobile_no, presence: true, length: {is: 10}, numericality: {only_integer: true}, uniqueness: true
  before_create :generate_user_token
  
  def ensure_authentication_token
  	if authentication_token.blank?
  		self.authentication_token = generate_authentication_token
  	end
  end
  
  def clear_authentication_token
  	self.authentication_token = nil
    ensure_authentication_token
  	self.save
  end

   def ensure_mobile_authentication_token
    if mobile_authentication_token.blank?
      self.mobile_authentication_token = generate_mobile_authentication_token
    end
  end

  def clear_mobile_authentication_token
    self.mobile_authentication_token = nil
    ensure_mobile_authentication_token
    self.save
  end

  def ability
    @ability ||= Ability.new(self)
  end

  private

  def generate_user_token
    begin
      self.user_token = SecureRandom.hex(64)
    end while self.class.exists?(user_token: self.user_token)
  end

  def generate_authentication_token
  	loop do 
  		token = Devise.friendly_token
  		break token unless User.where(authentication_token: token).first
  	end
  end

  def generate_mobile_authentication_token
    loop do 
      token = Devise.friendly_token
      break token unless User.where(mobile_authentication_token: token).first
    end
  end

end
