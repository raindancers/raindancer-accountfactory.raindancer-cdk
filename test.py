import boto3

session = boto3.session.Session(profile_name = 'moe-org', region_name='ap-southeast-2')

sc = session.client('servicecatalog')

account_factory_id = sc.search_products(
	Filters = {'FullTextSearch': ['AWS Control Tower Account Factory']}
)['ProductViewSummaries'][0]['ProductId']

print(account_factory_id)
