class RemoveAuthenticationTokens < ActiveRecord::Migration
  def change
  	remove_column :users, :authentication_token
  	remove_column :users, :mobile_authentication_token
  end
end
